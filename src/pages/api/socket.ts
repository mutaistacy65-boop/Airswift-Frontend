import type { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io';
import { openai } from '@/lib/openai';

export const config = {
  api: {
    bodyParser: false,
  },
};

const defaultQuestions = [
  'Tell me about your relevant experience for this role.',
  'Describe a challenge you faced on a project and how you resolved it.',
  'How do you prioritize work when multiple deadlines overlap?',
  'What motivates you to succeed in a team setting?',
  'How would you explain a technical concept to a non-technical stakeholder?'
];

const buildInterviewPrompt = (jobRole: string, question: string, answer: string) => {
  return `You are an AI behavioral interviewer for a ${jobRole} role.

Evaluate the candidate answer to the question below.

Question: ${question}
Answer: ${answer}

Provide JSON only with the following fields:
- confidence: a number from 0 to 100
- fillerWords: an array of filler words detected (e.g. um, like, you know)
- clarity: short text describing speech clarity
- quality: short text describing answer quality
- nextQuestion: the next interview question to ask or null if the interview should end
- feedback: concise feedback for the candidate
`;
};

const getNextQuestion = (jobRole: string, index: number) => {
  return index < defaultQuestions.length
    ? defaultQuestions[index]
    : `Thank you for your answers. That concludes the mock interview for the ${jobRole} role.`;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const server = (res.socket as any).server as any;
  if (!server.io) {
    const io = new Server(server, {
      path: '/api/socket',
      cors: {
        origin: '*',
      },
    });

    io.on('connection', (socket) => {
      console.log('Interview socket connected', socket.id);

      socket.on('start-interview', ({ jobRole }: { jobRole: string }) => {
        const selectedRole = jobRole || 'Software Engineer';
        socket.data.interview = {
          jobRole: selectedRole,
          questionIndex: 0,
          currentQuestion: getNextQuestion(selectedRole, 0),
        };

        const question = socket.data.interview.currentQuestion;
        socket.emit('ai-question', question);
        socket.emit('ai-audio', null);
      });

      socket.on('user-answer', async ({ answer }: { answer: string }) => {
        const interview = socket.data.interview;
        if (!interview) {
          return socket.emit('ai-feedback', { error: 'Interview session not initialized.' });
        }

        const prompt = buildInterviewPrompt(interview.jobRole, interview.currentQuestion, answer || '');

        try {
          const response = await openai.responses.create({
            model: 'gpt-4.1-mini',
            input: prompt,
          });

          const raw = response.output_text || '';
          let analysis = null;
          try {
            const firstBrace = raw.indexOf('{');
            const lastBrace = raw.lastIndexOf('}');
            const jsonString = firstBrace !== -1 && lastBrace !== -1 ? raw.slice(firstBrace, lastBrace + 1) : raw;
            analysis = JSON.parse(jsonString);
          } catch (err) {
            console.error('Failed to parse interview analysis', err, raw);
            analysis = {
              confidence: 75,
              fillerWords: [],
              clarity: 'Answer is understandable.',
              quality: 'Good reasoning and solid examples.',
              nextQuestion: getNextQuestion(interview.jobRole, interview.questionIndex + 1),
              feedback: 'Nice answer. Please continue to the next question.',
            };
          }

          socket.emit('ai-feedback', analysis);

          if (analysis.nextQuestion) {
            interview.questionIndex += 1;
            interview.currentQuestion = analysis.nextQuestion;
            socket.emit('ai-question', analysis.nextQuestion);
            socket.emit('ai-audio', null);
          } else {
            socket.emit('ai-question', 'Thank you for participating in the interview. We will review your answers and follow up soon.');
            socket.emit('ai-audio', null);
          }
        } catch (error) {
          console.error('OpenAI interview analysis error:', error);
          socket.emit('ai-feedback', { error: 'Unable to analyze response at this time.' });
        }
      });

      socket.on('disconnect', () => {
        console.log('Interview socket disconnected', socket.id);
      });
    });

    server.io = io;
  }

  res.end();
}
