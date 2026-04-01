import React, { useState } from 'react'
import Button from './Button'

interface DocumentUploadProps {
  label: string
  accept: string
  onFileSelect: (file: File | null) => void
  selectedFile: File | null
  required?: boolean
  error?: string
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  label,
  accept,
  onFileSelect,
  selectedFile,
  required = false,
  error
}) => {
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = (file: File | null) => {
    if (file && file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('File size must be less than 5MB')
      return
    }
    onFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  return (
    <div className="space-y-2">
      <label className="block text-gray-700 font-semibold">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-primary bg-primary/5'
            : selectedFile
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 hover:border-primary'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {selectedFile ? (
          <div className="space-y-2">
            <div className="text-green-600 text-lg">✓</div>
            <p className="text-gray-700 font-medium">{selectedFile.name}</p>
            <p className="text-gray-500 text-sm">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <Button
              onClick={() => handleFileSelect(null)}
              variant="outline"
              size="sm"
            >
              Remove
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-gray-400 text-4xl">📄</div>
            <p className="text-gray-600">
              Drag & drop your file here, or{' '}
              <label className="text-primary cursor-pointer hover:underline">
                browse
                <input
                  type="file"
                  accept={accept}
                  onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                  className="hidden"
                  required={required}
                />
              </label>
            </p>
            <p className="text-gray-400 text-sm">
              Supported formats: {accept.replace(/\./g, '').toUpperCase()} (Max 5MB)
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}

export default DocumentUpload
