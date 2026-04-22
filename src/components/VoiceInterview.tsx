import React, { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import Loader from '@/components/Loader'
import API from '@/services/apiClient'

interface VoiceInterviewProps {
  isOpen: boolean
  onClose: () => void
  jobRole: string
  candidateName: string
  onComplete?: (results: any) => void
}

interface InterviewState {
  isRecording: boolean
  currentQuestion: string
  isProcessing: boolean
  feedback: any
  sessionId: string | null
  transcript: string
  questionCount: number
}

const VoiceInterview: React.FC<VoiceInterviewProps> = ({
  isOpen,
  onClose,
  jobRole,
  candidateName,
  onComplete
}) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [interviewState, setInterviewState] = useState<InterviewState>({
    isRecording: false,
    currentQuestion: '',
    isProcessing: false,
    feedback: null,
    sessionId: null,
    transcript: '',
    questionCount: 0
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    // Prevent early socket connection: only connect if token exists
    if (isOpen && typeof window !== 'undefined' && localStorage.getItem('token')) {
      initializeSocket()
    }

    return () => {
      if (socket) {
        socket.disconnect()
      }
      stopRecording()
    }
  }, [isOpen])

  const initializeSocket = () => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://airswift-backend-fjt3.onrender.com'
    const socketPath = process.env.NEXT_PUBLIC_SOCKET_PATH || '/api/socket'

    const newSocket = io(socketUrl, {
      path: socketPath,
      withCredentials: true,
      transports: ["websocket"],
      auth: {
        token: typeof window !== 'undefined'
          ? localStorage.getItem('token') || undefined
          : undefined,
      },
    })

    newSocket.on('connect', () => {
      console.log('Voice interview socket connected')
      setSocket(newSocket)
    })

    newSocket.on('disconnect', () => {
      console.log('Voice interview socket disconnected')
    })

    newSocket.on('voice-interview-started', (data) => {
      setInterviewState(prev => ({
        ...prev,
        sessionId: data.sessionId,
        currentQuestion: data.firstQuestion,
        questionCount: 1
      }))
    })

    newSocket.on('voice-response-processed', (data) => {
      setInterviewState(prev => ({
        ...prev,
        feedback: data.analysis,
        isProcessing: false,
        transcript: data.transcript
      }))

      if (data.analysis.nextQuestion) {
        setTimeout(() => {
          setInterviewState(prev => ({
            ...prev,
            currentQuestion: data.analysis.nextQuestion,
            questionCount: prev.questionCount + 1,
            feedback: null
          }))
        }, 2000) // Show feedback for 2 seconds before next question
      } else {
        // Interview completed
        setTimeout(() => {
          handleInterviewComplete(data.analysis)
        }, 3000)
      }
    })

    newSocket.on('voice-interview-completed', (data) => {
      handleInterviewComplete(data.results)
    })

    newSocket.on('voice-interview-error', (error) => {
      console.error('Voice interview error:', error)
      setInterviewState(prev => ({
        ...prev,
        isProcessing: false,
        isRecording: false
      }))
      alert('An error occurred during the interview. Please try again.')
    })
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await processAudioResponse(audioBlob)
      }

      mediaRecorder.start()
      setInterviewState(prev => ({ ...prev, isRecording: true }))
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    setInterviewState(prev => ({ ...prev, isRecording: false }))
  }

  const processAudioResponse = async (audioBlob: Blob) => {
    if (!socket || !interviewState.sessionId) return

    setInterviewState(prev => ({ ...prev, isProcessing: true }))

    try {
      // Convert blob to file for upload
      const audioFile = new File([audioBlob], 'response.webm', { type: 'audio/webm' })

      // Create form data for transcription API
      const formData = new FormData()
      formData.append('audio', audioFile)

      // Transcribe audio using API instance for consistent token handling
      const transcriptionResult = await API.post('/interview/transcribe', formData)

      const transcriptionData = transcriptionResult.data

      // Send transcript to interview socket
      socket.emit('voice-response', {
        sessionId: interviewState.sessionId,
        transcript: transcriptionData.transcript,
        question: interviewState.currentQuestion
      })

    } catch (error) {
      console.error('Error processing audio response:', error)
      setInterviewState(prev => ({ ...prev, isProcessing: false }))
      alert('Failed to process your response. Please try again.')
    }
  }

  const handleStartInterview = () => {
    if (!socket) {
      alert('Connection not established. Please wait and try again.')
      return
    }

    socket.emit('start-voice-interview', {
      jobRole,
      candidateName
    })
  }

  const handleInterviewComplete = (results: any) => {
    if (onComplete) {
      onComplete(results)
    }
    onClose()
  }

  const handleClose = () => {
    if (socket) {
      socket.emit('end-voice-interview', { sessionId: interviewState.sessionId })
    }
    stopRecording()
    onClose()
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="AI Voice Interview">
      <div className="p-6 max-w-2xl mx-auto">
        {!interviewState.sessionId ? (
          // Interview setup
          <div className="text-center">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Welcome to your AI Interview</h3>
              <p className="text-gray-600">
                Position: <span className="font-medium">{jobRole}</span>
              </p>
              <p className="text-gray-600">
                Candidate: <span className="font-medium">{candidateName}</span>
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-blue-900 mb-2">Interview Instructions:</h4>
              <ul className="text-sm text-blue-800 text-left space-y-1">
                <li>• Ensure you're in a quiet environment</li>
                <li>• Speak clearly and at a normal pace</li>
                <li>• Click "Start Recording" when ready to answer</li>
                <li>• Click "Stop Recording" when finished</li>
                <li>• The AI will analyze your response and provide feedback</li>
              </ul>
            </div>

            <Button
              onClick={handleStartInterview}
              disabled={!socket}
              className="bg-green-600 hover:bg-green-700"
            >
              {!socket ? 'Connecting...' : 'Start Interview'}
            </Button>
          </div>
        ) : (
          // Active interview
          <div className="space-y-6">
            {/* Question Display */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Question {interviewState.questionCount}
                </span>
                <span className="text-xs text-gray-500">
                  {interviewState.isRecording ? 'Recording...' : 'Ready to record'}
                </span>
              </div>
              <p className="text-lg font-medium text-gray-900">
                {interviewState.currentQuestion}
              </p>
            </div>

            {/* Recording Controls */}
            <div className="flex justify-center space-x-4">
              {!interviewState.isRecording ? (
                <Button
                  onClick={startRecording}
                  disabled={interviewState.isProcessing}
                  className="bg-red-600 hover:bg-red-700"
                >
                  🎤 Start Recording
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  ⏹️ Stop Recording
                </Button>
              )}
            </div>

            {/* Processing Indicator */}
            {interviewState.isProcessing && (
              <div className="text-center">
                <Loader size="sm" />
                <p className="text-sm text-gray-600 mt-2">Processing your response...</p>
              </div>
            )}

            {/* Feedback Display */}
            {interviewState.feedback && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">AI Feedback:</h4>
                <div className="space-y-2 text-sm text-green-800">
                  <p><strong>Confidence:</strong> {interviewState.feedback.confidence}/100</p>
                  <p><strong>Clarity:</strong> {interviewState.feedback.clarity}</p>
                  <p><strong>Quality:</strong> {interviewState.feedback.quality}</p>
                  {interviewState.feedback.feedback && (
                    <p><strong>Feedback:</strong> {interviewState.feedback.feedback}</p>
                  )}
                </div>
              </div>
            )}

            {/* Transcript Display */}
            {interviewState.transcript && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Your Response:</h4>
                <p className="text-sm text-blue-800 italic">
                  "{interviewState.transcript}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

export default VoiceInterview