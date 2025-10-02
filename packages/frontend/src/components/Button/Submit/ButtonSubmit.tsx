import React from 'react';
import { Button } from 'antd';
import type { ButtonProps } from 'antd';

export interface ButtonSubmitProps extends Omit<ButtonProps, 'type' | 'htmlType'> {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export const ButtonSubmit: React.FC<ButtonSubmitProps> = ({
  children,
  loading = false,
  disabled = false,
  onClick,
  ...props
}) => {
  return (
    <Button
      type="primary"
      htmlType="submit"
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </Button>
  );
};

export default ButtonSubmit;