import React, { useState, useEffect } from 'react';
import Select from 'react-select';

interface Option {
  label: string;
  value: string;
}

interface JobSearchDropdownProps {
  value: string;
  onChange: (jobTitle: string) => void;
  error?: string;
  required?: boolean;
}

export default function JobSearchDropdown({
  value,
  onChange,
  error,
  required = false,
}: JobSearchDropdownProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch jobs on mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("https://airswift-backend-fjt3.onrender.com/api/applications/job-options");
        const data = await response.json();
        console.log("JOBS:", data);
        const jobs = Array.isArray(data)
          ? data
          : data?.jobs || []
        const sortedJobs = [...jobs].sort((a: any, b: any) => {
          if (typeof a === 'string' && typeof b === 'string') {
            return a.localeCompare(b)
          }
          if (a?.title && b?.title) {
            return a.title.localeCompare(b.title)
          }
          return 0
        })
        const options = sortedJobs.map((job: any) => ({
          label: typeof job === 'string' ? job : job.title || job.label || job.value,
          value: typeof job === 'string' ? job : job.title || job.value || job.label,
        }))
        options.sort((a, b) => a.label.localeCompare(b.label))
        setOptions(options);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Sync external value changes
  useEffect(() => {
    if (value) {
      const selected = options.find((opt) => opt.value === value);
      setSelectedOption(selected || null);
    } else {
      setSelectedOption(null);
    }
  }, [value, options]);

  // Handle job selection
  const handleChange = (option: Option | null) => {
    if (option) {
      setSelectedOption(option);
      onChange(option.value);
    } else {
      setSelectedOption(null);
      onChange('');
    }
  };

  // Custom styles for react-select
  const customStyles = {
    control: (base: any) => ({
      ...base,
      borderColor: error ? '#ef4444' : '#d1d5db',
      '&:hover': {
        borderColor: error ? '#ef4444' : '#9ca3af',
      },
      boxShadow: error ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none',
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? '#2563eb'
        : state.isFocused
        ? '#dbeafe'
        : 'white',
      color: state.isSelected ? 'white' : 'black',
      cursor: 'pointer',
      padding: '8px 16px',
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 10,
    }),
  };

  return (
    <div>
      <label className="sr-only">
        Job Title {required && <span className="text-red-500">*</span>}
      </label>

      <Select
        options={options}
        value={selectedOption}
        onChange={handleChange}
        placeholder="Type job title..."
        aria-label="Job Title"
        isLoading={isLoading}
        isClearable
        isSearchable
        styles={customStyles}
        noOptionsMessage={() => 'No jobs found'}
      />

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
