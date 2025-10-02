import React from 'react';
import { Button } from 'antd';
import type { ButtonProps } from 'antd';

export interface ButtonSecondaryProps extends Omit<ButtonProps, 'type'> {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export const ButtonSecondary: React.FC<ButtonSecondaryProps> = ({
  children,
  loading = false,
  disabled = false,
  onClick,
  ...props
}) => {
  return (
    <Button
      type="default"
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </Button>
  );
};

export default ButtonSecondary;