import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { openai } from '../../../lib/openai';
import { connectToDatabase } from '@/lib/mongodb';

const safeParseJSON = (text: string) => {
  try {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    const jsonString = firstBrace !== -1 && lastBrace !== -1 ? text.slice(firstBrace, lastBrace + 1) : text;
    return JSON.parse(jsonString);
  } catch (err) {
    console.error('JSON parse error:', err);
    return null;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { applications, jobDescription } = req.body;

  if (!Array.isArray(applications) || !jobDescription) {
    return res.status(400).json({ message: 'applications and jobDescription are required' });
  }

  const enrichedApplications = applications.map((app: any, index: number) => ({
    ...app,
    candidateId: app._id || app.id || `candidate-${index}`,
  }));

  const prompt = `You are an autonomous HR recruiter AI.\n\nJob Description:\n${jobDescription}\n\nApplications:\n${JSON.stringify(enrichedApplications, null, 2)}\n\nTasks:\n1. Score each candidate 0-100.\n2. Rank them from strongest to weakest.\n3. Select top 3 candidates.\n4. Reject weak candidates.\n5. Output JSON only with candidateId references.\n\nExpected output format:\n{\n  "topCandidates": [\n    {\n      "candidateId": "...",\n      "score": 92,\n      "summary": "Strong communication, relevant experience..."\n    }\n  ],\n  "rejected": [\n    {\n      "candidateId": "...",\n      "score": 18,\n      "summary": "Limited experience and weak cultural fit."\n    }\n  ],\n  "reasoning": ""\n}\n`;

  try {
    const response = await openai.responses.create({
      model: 'gpt-4.1-mini',
      input: prompt,
    });

    const outputText = response.output_text || '';
    const result = safeParseJSON(outputText);

    if (!result || !Array.isArray(result.topCandidates) || !Array.isArray(result.rejected)) {
      return res.status(500).json({ message: 'Unexpected AI response format', raw: outputText });
    }

    try {
      const { db } = await connectToDatabase();
      const topIds = new Set(result.topCandidates.map((item: any) => item.candidateId));
      const rejectedIds = new Set(result.rejected.map((item: any) => item.candidateId));

      // Update application statuses and send emails
      await Promise.all(
        enrichedApplications.map(async (app: any) => {
          if (!app.candidateId || !/^[0-9a-fA-F]{24}$/.test(String(app.candidateId))) {
            return null;
          }

          const newStatus = rejectedIds.has(app.candidateId)
            ? 'rejected'
            : topIds.has(app.candidateId)
            ? 'reviewed'
            : app.status || 'pending';

          // Update status
          await db.collection('applications').updateOne(
            { _id: new ObjectId(app.candidateId) },
            {
              $set: {
                status: newStatus,
                recruiterAnalysis: {
                  candidateId: app.candidateId,
                  record:
                    result.topCandidates.find((item: any) => item.candidateId === app.candidateId)
                      || result.rejected.find((item: any) => item.candidateId === app.candidateId)
                      || null,
                  reasoning: result.reasoning || '',
                },
                updatedAt: new Date(),
              },
            }
          );

          // Send automated emails
          if (newStatus === 'rejected' && app.email) {
            try {
              // Send rejection email
              await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/emails/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  templateId: 'application_rejected',
                  recipientEmail: app.email,
                  variables: {
                    applicantName: app.fullName || 'Candidate',
                    jobTitle: app.jobId?.title || 'Position',
                    companyName: 'Airswift'
                  }
                })
              });
            } catch (emailError) {
              console.error('Error sending rejection email:', emailError);
            }
          } else if (newStatus === 'reviewed' && app.email) {
            try {
              // Send shortlist email
              await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/emails/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  templateId: 'application_reviewed',
                  recipientEmail: app.email,
                  variables: {
                    applicantName: app.fullName || 'Candidate',
                    jobTitle: app.jobId?.title || 'Position',
                    companyName: 'Airswift'
                  }
                })
              });
            } catch (emailError) {
              console.error('Error sending shortlist email:', emailError);
            }
          }

          return true;
        })
      );
    } catch (dbError) {
      console.error('Database update error:', dbError);
    }

    return res.json(result);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
