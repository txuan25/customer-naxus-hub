import React from 'react';
import { Tag } from 'antd';
import type { TagProps } from 'antd';

export interface PriorityIndicatorProps extends Omit<TagProps, 'color'> {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  children?: React.ReactNode;
}

const priorityConfig = {
  low: { color: 'blue', text: 'Low', icon: '●' },
  medium: { color: 'orange', text: 'Medium', icon: '●●' },
  high: { color: 'red', text: 'High', icon: '●●●' },
  urgent: { color: 'magenta', text: 'Urgent', icon: '⚠️' }
};

export const PriorityIndicator: React.FC<PriorityIndicatorProps> = ({
  priority,
  children,
  ...props
}) => {
  const config = priorityConfig[priority];
  
  return (
    <Tag color={config.color} {...props}>
      <span style={{ marginRight: '4px' }}>{config.icon}</span>
      {children || config.text}
    </Tag>
  );
};

// Individual Priority Components for semantic usage
export const PriorityLow: React.FC<Omit<PriorityIndicatorProps, 'priority'>> = (props) => (
  <PriorityIndicator priority="low" {...props} />
);

export const PriorityMedium: React.FC<Omit<PriorityIndicatorProps, 'priority'>> = (props) => (
  <PriorityIndicator priority="medium" {...props} />
);

export const PriorityHigh: React.FC<Omit<PriorityIndicatorProps, 'priority'>> = (props) => (
  <PriorityIndicator priority="high" {...props} />
);

export const PriorityUrgent: React.FC<Omit<PriorityIndicatorProps, 'priority'>> = (props) => (
  <PriorityIndicator priority="urgent" {...props} />
);

export default PriorityIndicator;