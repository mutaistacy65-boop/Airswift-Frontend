import { NextApiRequest, NextApiResponse } from 'next';
import { openai } from '../../../lib/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { messages } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a strict technical interviewer. Ask one question at a time and evaluate answers."
        },
        ...messages
      ],
    });

    res.json({
      reply: response.choices[0].message.content
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}