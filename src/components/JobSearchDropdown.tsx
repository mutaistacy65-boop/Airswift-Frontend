import React from 'react';

interface JobSearchDropdownProps {
  value: string;
  onChange: (jobTitle: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

export default function JobSearchDropdown({
  value,
  onChange,
  error,
  required = false,
  placeholder = 'Enter job title...',
}: JobSearchDropdownProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Job Title {required && <span className="text-red-500">*</span>}
      </label>

      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        }`}
      />

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
