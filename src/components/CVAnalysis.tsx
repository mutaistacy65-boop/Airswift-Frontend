import React, { useState, useRef } from 'react'
import Button from './Button'
import Loader from './Loader'
import API from '@/services/apiClient'

interface CVAnalysisResult {
  score: number
  skills: string[]
  summary: string
  recommendation: 'reject' | 'shortlist' | 'hire'
}

interface CVAnalysisProps {
  jobRole?: string
  onAnalysisComplete?: (result: CVAnalysisResult) => void
  className?: string
}

const CVAnalysis: React.FC<CVAnalysisProps> = ({
  jobRole = 'Software Engineer',
  onAnalysisComplete,
  className = ''
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<CVAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file only')
        return
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB')
        return
      }
      setSelectedFile(file)
      setError(null)
      setResult(null)
    }
  }

  const extractTextFromPDF = async (file: File): Promise<string> => {
    // For now, we'll use a simple approach. In production, you'd use a proper PDF parsing library
    // This is a placeholder - you'd need to implement actual PDF text extraction
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        // This is just a placeholder - actual PDF text extraction would require pdf-parse or similar
        // For demo purposes, we'll return a sample CV text
        const sampleCV = `
John Doe
Software Engineer

Experience:
- 3 years as Full Stack Developer at Tech Corp
- Built React applications with TypeScript
- Developed REST APIs with Node.js
- Worked with databases (PostgreSQL, MongoDB)

Skills:
- JavaScript, TypeScript, Python
- React, Next.js, Node.js
- PostgreSQL, MongoDB
- Git, Docker, AWS

Education:
- Bachelor's in Computer Science
- GPA: 3.8/4.0
        `
        resolve(sampleCV)
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsArrayBuffer(file)
    })
  }

  const analyzeCV = async () => {
    if (!selectedFile) return

    setAnalyzing(true)
    setError(null)

    try {
      // Extract text from PDF
      const cvText = await extractTextFromPDF(selectedFile)

      // Send to CV analysis API
      const result = await API.post('/cv/score', {
        cvText,
        jobRole
      })

      const analysisResult: CVAnalysisResult = result.data
      setResult(analysisResult)

      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResult)
      }
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || 'Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const resetAnalysis = () => {
    setSelectedFile(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'hire': return 'bg-green-100 text-green-800'
      case 'shortlist': return 'bg-blue-100 text-blue-800'
      case 'reject': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">AI CV Analysis</h3>

      {!result ? (
        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CV (PDF only, max 5MB)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* Job Role Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Role
            </label>
            <input
              type="text"
              value={jobRole}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={analyzeCV}
              disabled={!selectedFile || analyzing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {analyzing ? (
                <>
                  <Loader size="sm" />
                  Analyzing...
                </>
              ) : (
                'Analyze CV'
              )}
            </Button>

            {selectedFile && (
              <Button
                onClick={resetAnalysis}
                variant="outline"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Analysis Results */
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-md font-medium">Analysis Results</h4>
            <Button
              onClick={resetAnalysis}
              variant="outline"
              size="sm"
            >
              Analyze Another CV
            </Button>
          </div>

          {/* Score */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Match Score</span>
              <span className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                {result.score}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${result.score >= 80 ? 'bg-green-500' : result.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${result.score}%` }}
              ></div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-gray-50 rounded-lg p-4">
            <span className="text-sm font-medium text-gray-700">Recommendation</span>
            <div className="mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(result.recommendation)}`}>
                {result.recommendation.charAt(0).toUpperCase() + result.recommendation.slice(1)}
              </span>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-gray-50 rounded-lg p-4">
            <span className="text-sm font-medium text-gray-700">Identified Skills</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {result.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <span className="text-sm font-medium text-gray-700">Summary</span>
            <p className="mt-2 text-sm text-gray-600">{result.summary}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default CVAnalysis