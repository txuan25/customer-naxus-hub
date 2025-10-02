import React from 'react';
import { Input } from 'antd';
import type { InputProps } from 'antd';

export interface InputPasswordProps extends Omit<InputProps, 'type'> {
  label?: string;
  error?: string;
  required?: boolean;
  showStrengthIndicator?: boolean;
  onValidate?: (isValid: boolean, strength?: 'weak' | 'medium' | 'strong') => void;
}

export const InputPassword: React.FC<InputPasswordProps> = ({
  label,
  error,
  required = false,
  showStrengthIndicator = false,
  onValidate,
  onChange,
  ...props
}) => {
  const [strength, setStrength] = React.useState<'weak' | 'medium' | 'strong'>('weak');

  const calculateStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    const score = [hasLower, hasUpper, hasNumber, hasSpecial, isLongEnough].filter(Boolean).length;

    if (score >= 4) return 'strong';
    if (score >= 2) return 'medium';
    return 'weak';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const passwordStrength = calculateStrength(value);
    const isValid = value.length >= 6; // Minimum validation
    
    setStrength(passwordStrength);
    
    if (onValidate) {
      onValidate(isValid, passwordStrength);
    }
    
    if (onChange) {
      onChange(e);
    }
  };

  const getStrengthColor = () => {
    switch (strength) {
      case 'strong': return '#52c41a';
      case 'medium': return '#faad14';
      case 'weak': return '#ff4d4f';
      default: return '#d9d9d9';
    }
  };

  return (
    <div className="input-password-wrapper">
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="required-asterisk"> *</span>}
        </label>
      )}
      <Input.Password
        status={error ? 'error' : undefined}
        placeholder="Enter password"
        onChange={handleChange}
        {...props}
      />
      {showStrengthIndicator && (
        <div className="password-strength" style={{ marginTop: '4px' }}>
          <div style={{ fontSize: '12px', color: getStrengthColor() }}>
            Password strength: {strength}
          </div>
        </div>
      )}
      {error && (
        <div className="input-error" style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default InputPassword;