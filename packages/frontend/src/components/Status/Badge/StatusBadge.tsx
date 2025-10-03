import React from 'react';
import { Tag } from 'antd';
import type { TagProps } from 'antd';
import { InquiryStatus, ResponseStatus, InquiryPriority } from '../../../types';

export interface StatusBadgeProps extends Omit<TagProps, 'color'> {
  status: 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | InquiryStatus | ResponseStatus;
  children?: React.ReactNode;
}

export interface PriorityBadgeProps extends Omit<TagProps, 'color'> {
  priority: InquiryPriority;
  children?: React.ReactNode;
}

const statusConfig = {
  // Original statuses
  active: { color: 'green', text: 'Active' },
  inactive: { color: 'default', text: 'Inactive' },
  pending: { color: 'orange', text: 'Pending' },
  approved: { color: 'green', text: 'Approved' },
  rejected: { color: 'red', text: 'Rejected' },
  
  // Inquiry statuses
  'open': { color: 'blue', text: 'Open' },
  'in_progress': { color: 'orange', text: 'In Progress' },
  'pending_approval': { color: 'gold', text: 'Pending Approval' },
  'inquiry_approved': { color: 'green', text: 'Approved' },
  'inquiry_rejected': { color: 'red', text: 'Rejected' },
  'closed': { color: 'default', text: 'Closed' },
  
  // Response statuses
  'draft': { color: 'default', text: 'Draft' },
  'response_pending_approval': { color: 'orange', text: 'Pending Approval' },
  'response_approved': { color: 'green', text: 'Approved' },
  'response_rejected': { color: 'red', text: 'Rejected' },
  'sent': { color: 'blue', text: 'Sent' },
};

const priorityConfig = {
  [InquiryPriority.LOW]: { color: 'default', text: 'Low' },
  [InquiryPriority.MEDIUM]: { color: 'orange', text: 'Medium' },
  [InquiryPriority.HIGH]: { color: 'red', text: 'High' },
  [InquiryPriority.URGENT]: { color: 'magenta', text: 'Urgent' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  children,
  ...props
}) => {
  let configKey = status as string;
  
  // Map inquiry statuses to unique keys
  if (Object.values(InquiryStatus).includes(status as InquiryStatus)) {
    if (status === InquiryStatus.RESPONDED) configKey = 'inquiry_approved';
    else if (status === InquiryStatus.CLOSED) configKey = 'inquiry_rejected';
    else if (status === InquiryStatus.PENDING) configKey = 'pending_approval';
  }
  
  // Map response statuses to unique keys  
  if (Object.values(ResponseStatus).includes(status as ResponseStatus)) {
    if (status === ResponseStatus.APPROVED) configKey = 'response_approved';
    else if (status === ResponseStatus.REJECTED) configKey = 'response_rejected';
    else if (status === ResponseStatus.PENDING_APPROVAL) configKey = 'response_pending_approval';
  }
  
  const config = statusConfig[configKey as keyof typeof statusConfig];
  
  return (
    <Tag color={config?.color || 'default'} {...props}>
      {children || config?.text || status}
    </Tag>
  );
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  children,
  ...props
}) => {
  const config = priorityConfig[priority];
  
  return (
    <Tag color={config.color} {...props}>
      {children || config.text}
    </Tag>
  );
};

// Individual Status Components for semantic usage
export const StatusActive: React.FC<Omit<StatusBadgeProps, 'status'>> = (props) => (
  <StatusBadge status="active" {...props} />
);

export const StatusInactive: React.FC<Omit<StatusBadgeProps, 'status'>> = (props) => (
  <StatusBadge status="inactive" {...props} />
);

export const StatusPending: React.FC<Omit<StatusBadgeProps, 'status'>> = (props) => (
  <StatusBadge status="pending" {...props} />
);

export const StatusApproved: React.FC<Omit<StatusBadgeProps, 'status'>> = (props) => (
  <StatusBadge status="approved" {...props} />
);

export const StatusRejected: React.FC<Omit<StatusBadgeProps, 'status'>> = (props) => (
  <StatusBadge status="rejected" {...props} />
);

// Inquiry Status Components
export const InquiryStatusBadge: React.FC<{ status: InquiryStatus }> = ({ status, ...props }) => (
  <StatusBadge status={status} {...props} />
);

// Response Status Components  
export const ResponseStatusBadge: React.FC<{ status: ResponseStatus }> = ({ status, ...props }) => (
  <StatusBadge status={status} {...props} />
);

export default StatusBadge;