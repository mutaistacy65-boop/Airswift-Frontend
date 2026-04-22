// @ts-nocheck
import { NextApiRequest, NextApiResponse } from 'next';
import { openai } from '../../../lib/openai';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error parsing form' });
    }

    const file = files.audio as any;
    if (!file) {
      return res.status(400).json({ message: 'No audio file provided' });
    }

    try {
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(file.filepath),
        model: 'whisper-1',
      });

      res.json({ text: transcription.text });
    } catch (error) {
      console.error('Transcription error:', error);
      res.status(500).json({ message: 'Transcription failed' });
    }
  });
}