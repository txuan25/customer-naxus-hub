import React from 'react';
import { Input } from 'antd';
import type { InputProps } from 'antd';

export interface InputTextProps extends InputProps {
  label?: string;
  error?: string;
  required?: boolean;
}

export const InputText: React.FC<InputTextProps> = ({
  label,
  error,
  required = false,
  ...props
}) => {
  return (
    <div className="input-text-wrapper">
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="required-asterisk"> *</span>}
        </label>
      )}
      <Input
        status={error ? 'error' : undefined}
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

export default InputText;