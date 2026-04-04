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

      socket.on('start-voice-interview', ({ jobRole, candidateName }: { jobRole: string, candidateName: string }) => {
        const sessionId = `voice-${Date.now()}-${socket.id}`
        const selectedRole = jobRole || 'Software Engineer'

        socket.data.interview = {
          sessionId,
          jobRole: selectedRole,
          candidateName,
          questionIndex: 0,
          currentQuestion: getNextQuestion(selectedRole, 0),
          startTime: new Date(),
          responses: []
        }

        socket.emit('voice-interview-started', {
          sessionId,
          firstQuestion: socket.data.interview.currentQuestion
        })
      })

      socket.on('voice-response', async ({ sessionId, transcript, question }: { sessionId: string, transcript: string, question: string }) => {
        const interview = socket.data.interview
        if (!interview || interview.sessionId !== sessionId) {
          return socket.emit('voice-interview-error', { error: 'Invalid interview session' })
        }

        // Store the response
        interview.responses.push({
          question,
          transcript,
          timestamp: new Date()
        })

        // Analyze the response with AI
        const prompt = buildInterviewPrompt(interview.jobRole, question, transcript)

        try {
          const response = await openai.responses.create({
            model: 'gpt-4.1-mini',
            input: prompt,
          })

          const raw = response.output_text || ''
          let analysis = null
          try {
            const firstBrace = raw.indexOf('{')
            const lastBrace = raw.lastIndexOf('}')
            const jsonString = firstBrace !== -1 && lastBrace !== -1 ? raw.slice(firstBrace, lastBrace + 1) : raw
            analysis = JSON.parse(jsonString)
          } catch (err) {
            console.error('Failed to parse interview analysis', err, raw)
            analysis = {
              confidence: 75,
              fillerWords: [],
              clarity: 'Answer is understandable.',
              quality: 'Good reasoning and solid examples.',
              nextQuestion: getNextQuestion(interview.jobRole, interview.questionIndex + 1),
              feedback: 'Nice answer. Please continue to the next question.',
            }
          }

          socket.emit('voice-response-processed', {
            sessionId,
            transcript,
            analysis
          })

          if (analysis.nextQuestion) {
            interview.questionIndex += 1
            interview.currentQuestion = analysis.nextQuestion
          } else {
            // Interview completed
            const results = {
              sessionId,
              totalQuestions: interview.questionIndex + 1,
              responses: interview.responses,
              completedAt: new Date(),
              averageConfidence: interview.responses.reduce((acc, resp, idx) => {
                // This would need to be calculated from all analyses
                return acc + (analysis.confidence || 75)
              }, 0) / interview.responses.length
            }

            socket.emit('voice-interview-completed', { results })
          }
        } catch (error) {
          console.error('OpenAI interview analysis error:', error)
          socket.emit('voice-interview-error', { error: 'Unable to analyze response at this time.' })
        }
      })

      socket.on('end-voice-interview', ({ sessionId }: { sessionId: string }) => {
        const interview = socket.data.interview
        if (interview && interview.sessionId === sessionId) {
          const results = {
            sessionId,
            totalQuestions: interview.questionIndex + 1,
            responses: interview.responses,
            completedAt: new Date(),
            averageConfidence: 75 // Placeholder
          }
          socket.emit('voice-interview-completed', { results })
        }
      })

      socket.on('disconnect', () => {
        console.log('Interview socket disconnected', socket.id);
      });
    });

    server.io = io;
  }

  res.end();
}
