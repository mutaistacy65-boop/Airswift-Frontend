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
        <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
          {label}
          {props.required && <span className="text-red-400">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          className={`w-full px-4 py-3 ${icon ? 'pl-12' : ''} bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/20 hover:border-white/30 ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-red-400 text-xs mt-2">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-slate-400 text-xs mt-2">{helpText}</p>
      )}
    </div>
  )
}

export default Input