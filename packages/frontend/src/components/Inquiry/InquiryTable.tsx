import React from 'react';
import { Space, Button, Typography, Tooltip, Input } from 'antd';
import { EyeOutlined, MessageOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigation, useGetIdentity, useGo } from '@refinedev/core';
import type { ColumnsType } from 'antd/es/table';
import { Inquiry, User, UserRole, InquiryStatus, InquiryPriority } from '../../types';
import { DataTable } from '../DataTable/DataTable';
import { StatusBadge, PriorityBadge } from '../Status/Badge/StatusBadge';

const { Text } = Typography;

export interface InquiryTableProps {
  inquiries: Inquiry[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger?: boolean;
    pageSizeOptions?: string[];
    onChange?: (page: number, pageSize: number) => void;
  };
  onSearch?: (value: string) => void;
}

export const InquiryTable: React.FC<InquiryTableProps> = ({
  inquiries,
  loading = false,
  pagination,
  onSearch
}) => {
  // Safe hook usage with fallbacks for Storybook
  const navigation = (() => {
    try {
      return useNavigation();
    } catch {
      return {
        show: (resource: string, id: string) => console.log('Navigate to show:', resource, id),
        edit: (resource: string, id: string) => console.log('Navigate to edit:', resource, id),
        create: (resource: string, action?: string, params?: any) => console.log('Navigate to create:', resource, action, params),
      };
    }
  })();
  
  const goHook = (() => {
    try {
      return useGo();
    } catch {
      return ({ to, query }: any) => console.log('Navigate to:', to, 'with query:', query);
    }
  })();
  
  const identityHook = (() => {
    try {
      return useGetIdentity<User>();
    } catch {
      return {
        data: {
          id: 'mock-user',
          email: 'mock@example.com',
          firstName: 'Mock',
          lastName: 'User',
          fullName: 'Mock User',
          role: 'MANAGER' as any
        }
      };
    }
  })();

  const { show, create } = navigation;
  const go = goHook;
  const { data: identity } = identityHook;

  const canCreateResponse = (inquiry: Inquiry): boolean => {
    if (!identity) {
      return false;
    }
    
    // CSO can only reply to OPEN and IN_PROGRESS inquiries
    if (identity.role === UserRole.CSO) {
      return [InquiryStatus.PENDING, InquiryStatus.IN_PROGRESS].includes(inquiry.status);
    }
    
    // Manager can create responses for all inquiry statuses
    return identity.role === UserRole.MANAGER;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCustomerName = (inquiry: Inquiry): string => {
    if (inquiry.customer) {
      return `${inquiry.customer.firstName} ${inquiry.customer.lastName}`;
    }
    return 'Unknown Customer';
  };

  const columns: ColumnsType<Inquiry> = [
    {
      title: 'Customer',
      key: 'customer',
      render: (_, inquiry) => (
        <Space direction="vertical" size={0}>
          <Text strong>{getCustomerName(inquiry)}</Text>
          {inquiry.customer?.email && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {inquiry.customer.email}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: (subject: string, inquiry) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ cursor: 'pointer' }}
                onClick={() => show('inquiries', inquiry.id)}>
            {subject}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            ID: {inquiry.id.slice(0, 8)}...
          </Text>
        </Space>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: InquiryPriority) => (
        <PriorityBadge priority={priority} />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: InquiryStatus) => (
        <StatusBadge status={status} />
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <Tooltip title={new Date(date).toLocaleString()}>
          <Text>{formatDate(date)}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, inquiry) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => show('inquiries', inquiry.id)}
              size="small"
            />
          </Tooltip>
          
          {canCreateResponse(inquiry) && (
            <Tooltip title="Create Response">
              <Button
                type="text"
                icon={<MessageOutlined />}
                onClick={() => go({
                  to: '/responses/create',
                  query: { inquiryId: inquiry.id }
                })}
                size="small"
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={inquiries}
      loading={loading}
      pagination={pagination}
      searchable={false}
      onSearch={onSearch}
    />
  );
};

export default InquiryTable;