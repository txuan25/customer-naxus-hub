import React from 'react';
import { Button } from 'antd';
import type { ButtonProps } from 'antd';

export interface ButtonPrimaryProps extends Omit<ButtonProps, 'type'> {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
  children,
  loading = false,
  disabled = false,
  onClick,
  ...props
}) => {
  return (
    <Button
      type="primary"
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </Button>
  );
};

export default ButtonPrimary;