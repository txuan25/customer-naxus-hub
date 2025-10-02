import React from 'react';
import { Input } from 'antd';
import type { InputProps } from 'antd';

export interface InputEmailProps extends Omit<InputProps, 'type'> {
  label?: string;
  error?: string;
  required?: boolean;
  onValidate?: (isValid: boolean) => void;
}

export const InputEmail: React.FC<InputEmailProps> = ({
  label,
  error,
  required = false,
  onValidate,
  onChange,
  ...props
}) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const isValid = value === '' || emailRegex.test(value);
    
    if (onValidate) {
      onValidate(isValid);
    }
    
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="input-email-wrapper">
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="required-asterisk"> *</span>}
        </label>
      )}
      <Input
        type="email"
        status={error ? 'error' : undefined}
        placeholder="example@domain.com"
        onChange={handleChange}
        {...props}
      />
      {error && (
        <div className="input-error" style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default InputEmail;