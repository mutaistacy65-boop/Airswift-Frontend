// @ts-nocheck
import { NextApiRequest, NextApiResponse } from 'next';
import { openai } from '../../../lib/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { cvText, jobRole } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an HR AI. Analyze the candidate's CV for the job role and return a JSON response with score (0-100), skills array, summary, and recommendation (reject | shortlist | hire).`
        },
        {
          role: "user",
          content: `
Job Role: ${jobRole}

Candidate CV:
${cvText}

Return JSON only:
{
  "score": 0-100,
  "skills": [],
  "summary": "",
  "recommendation": "reject | shortlist | hire"
}
`
        }
      ],
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    res.json(result);
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}