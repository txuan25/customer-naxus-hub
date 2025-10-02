import React from 'react';
import { Card, Statistic, Space } from 'antd';
import type { CardProps } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  UserOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';

export interface StatsCardProps extends Omit<CardProps, 'children'> {
  title: string;
  value: number | string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: 'users' | 'messages' | 'approved' | 'pending' | React.ReactNode;
  loading?: boolean;
  valueColor?: string;
}

const iconMap = {
  users: <UserOutlined />,
  messages: <MessageOutlined />,
  approved: <CheckCircleOutlined />,
  pending: <ClockCircleOutlined />,
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  loading = false,
  valueColor,
  ...props
}) => {
  const getIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === 'string' && icon in iconMap) {
      return iconMap[icon as keyof typeof iconMap];
    }
    return null;
  };

  const getChangeIcon = () => {
    if (!change) return null;
    return change.type === 'increase' ? (
      <ArrowUpOutlined style={{ color: '#52c41a' }} />
    ) : (
      <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
    );
  };

  const getChangeColor = () => {
    if (!change) return undefined;
    return change.type === 'increase' ? '#52c41a' : '#ff4d4f';
  };

  return (
    <Card 
      loading={loading}
      {...props}
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <Statistic
              title={title}
              value={value}
              valueStyle={{ 
                color: valueColor || '#1890ff',
                fontSize: '24px',
                fontWeight: 'bold'
              }}
            />
          </div>
          {getIcon() && (
            <div style={{ 
              fontSize: '24px', 
              color: '#1890ff',
              opacity: 0.7
            }}>
              {getIcon()}
            </div>
          )}
        </div>
        
        {change && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            color: getChangeColor(),
            fontSize: '12px'
          }}>
            {getChangeIcon()}
            <span>
              {Math.abs(change.value)}% from last period
            </span>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default StatsCard;