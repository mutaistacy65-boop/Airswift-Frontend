import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from './Input';
import Textarea from './Textarea';
import Button from './Button';

interface Field {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'checkbox';
  value?: any;
  required?: boolean;
  options?: { label: string; value: any }[];
  rows?: number;
}

interface EditModalProps {
  isOpen: boolean;
  title: string;
  fields: Field[];
  onClose: () => void;
  onSave: (data: any) => void;
  loading?: boolean;
  lastSaved?: Date | null;
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  title,
  fields,
  onClose,
  onSave,
  loading = false,
  lastSaved = null,
}) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      const initialData: any = {};
      fields.forEach(field => {
        initialData[field.name] = field.value || '';
      });
      setFormData(initialData);
    }
  }, [isOpen, fields]);

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const renderField = (field: Field) => {
    const value = formData[field.name] || '';

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            key={field.name}
            label={field.label}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            required={field.required}
            rows={field.rows || 3}
          />
        );
      case 'select':
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={field.required}
            >
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
      case 'checkbox':
        return (
          <div key={field.name} className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => handleInputChange(field.name, e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">{field.label}</span>
            </label>
          </div>
        );
      default:
        return (
          <Input
            key={field.name}
            label={field.label}
            type={field.type}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            required={field.required}
          />
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      onConfirm={handleSave}
      confirmText={loading ? 'Saving...' : 'Save Changes'}
    >
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {fields.map(renderField)}
        {lastSaved && (
          <div className="text-sm text-gray-500 mt-4">
            Last saved: {new Date(lastSaved).toLocaleString()}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EditModal;