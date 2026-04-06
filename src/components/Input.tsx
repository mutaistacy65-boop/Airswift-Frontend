import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  helpText?: string
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  icon, 
  helpText,
  className = '', 
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          {label}
          {props.required && <span className="text-danger">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={`w-full px-4 py-3 ${icon ? 'pl-12' : ''} bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-secondary transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-gray-400 ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-danger text-xs mt-2">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-gray-500 text-xs mt-2">{helpText}</p>
      )}
    </div>
  )
}

export default Input