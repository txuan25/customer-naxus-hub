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
    if (!identity) return false;
    // CSO can create responses for assigned inquiries, Manager can create for all
    if (identity.role === UserRole.CSO) {
      return inquiry.assignedTo?.id === identity.id && 
             [InquiryStatus.OPEN, InquiryStatus.IN_PROGRESS].includes(inquiry.status);
    }
    return identity.role === UserRole.MANAGER && 
           [InquiryStatus.OPEN, InquiryStatus.IN_PROGRESS].includes(inquiry.status);
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
      sorter: (a, b) => getCustomerName(a).localeCompare(getCustomerName(b)),
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
      sorter: (a, b) => a.subject.localeCompare(b.subject),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: InquiryPriority) => (
        <PriorityBadge priority={priority} />
      ),
      filters: Object.values(InquiryPriority).map(priority => ({
        text: priority.charAt(0).toUpperCase() + priority.slice(1),
        value: priority,
      })),
      onFilter: (value, record) => record.priority === value,
      sorter: (a, b) => {
        const priorityOrder = [InquiryPriority.LOW, InquiryPriority.MEDIUM, InquiryPriority.HIGH, InquiryPriority.URGENT];
        return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: InquiryStatus) => (
        <StatusBadge status={status} />
      ),
      filters: Object.values(InquiryStatus).map(status => ({
        text: status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        value: status,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Assigned To',
      key: 'assignedTo',
      render: (_, inquiry) => (
        inquiry.assignedTo ? (
          <Space>
            <Text>{inquiry.assignedTo.firstName} {inquiry.assignedTo.lastName}</Text>
          </Space>
        ) : (
          <Text type="secondary">Unassigned</Text>
        )
      ),
      filters: identity?.role === UserRole.MANAGER ? [
        { text: 'Assigned', value: 'assigned' },
        { text: 'Unassigned', value: 'unassigned' },
      ] : undefined,
      onFilter: (value, record) => {
        if (value === 'assigned') return !!record.assignedTo;
        if (value === 'unassigned') return !record.assignedTo;
        return true;
      },
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
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: 'descend',
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
      searchable={true}
      onSearch={onSearch}
    />
  );
};

export default InquiryTable;