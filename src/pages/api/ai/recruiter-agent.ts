import { NextApiRequest, NextApiResponse } from 'next';
import { openai } from '../../../lib/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { applications, jobDescription } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an autonomous HR recruiter AI. Analyze applications, score candidates, rank them, select top 3, reject weak ones, and output JSON only.`
        },
        {
          role: "user",
          content: `
Job Description:
${jobDescription}

Applications:
${JSON.stringify(applications)}

Tasks:
1. Score each candidate 0-100
2. Rank them
3. Select top 3
4. Reject weak candidates
5. Output JSON only:

{
  "topCandidates": [],
  "rejected": [],
  "reasoning": ""
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