import React from 'react';
import { Space, Button, Typography, Tooltip } from 'antd';
import { EditOutlined, EyeOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigation, useDelete, useGetIdentity } from '@refinedev/core';
import type { ColumnsType } from 'antd/es/table';
import { Customer, User, UserRole } from '../../types';
import { DataTable } from '../DataTable/DataTable';
import { formatDate, getFullName as getFullNameUtil, createPermissionChecker, useSafeNavigation, useSafeDelete, useSafeIdentity } from '../DataTable/tableUtils';

const { Text } = Typography;

export interface CustomerTableProps {
  customers: Customer[];
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

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  loading = false,
  pagination,
  onSearch
}) => {
  // Safe hook usage with fallbacks for Storybook
  const navigation = (() => {
    try {
      return useNavigation();
    } catch {
      return useSafeNavigation();
    }
  })();
  
  const deleteHook = (() => {
    try {
      return useDelete();
    } catch {
      return useSafeDelete();
    }
  })();
  
  const identityHook = (() => {
    try {
      return useGetIdentity<User>();
    } catch {
      return useSafeIdentity();
    }
  })();

  const { show, edit, create } = navigation;
  const { mutate: deleteCustomer } = deleteHook;
  const { data: identity } = identityHook;

  // Use shared permission logic
  const permissions = createPermissionChecker(identity);

  const handleDelete = (id: string) => {
    deleteCustomer({
      resource: 'customers',
      id,
    });
  };

  const canDelete = (customer: Customer): boolean => {
    if (!identity) return false;
    // Only Manager can delete customers
    return identity.role === UserRole.MANAGER;
  };

  const canEdit = (customer: Customer): boolean => {
    if (!identity) return false;
    // Manager can edit all customers
    return identity.role === UserRole.MANAGER;
  };

  const getFullName = (customer: Customer): string => {
    return `${customer.firstName} ${customer.lastName}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const columns: ColumnsType<Customer> = [
    {
      title: 'Name',
      key: 'name',
      render: (_, customer) => (
        <Space direction="vertical" size={0}>
          <Text strong>{getFullNameUtil(customer.firstName, customer.lastName)}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            ID: {customer.id.slice(0, 8)}...
          </Text>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => (
        <Text copyable={{ text: email }}>
          {email}
        </Text>
      ),
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
      render: (company?: string) => company || <Text type="secondary">-</Text>,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone?: string) => phone || <Text type="secondary">-</Text>,
    },
    {
      title: 'Created',
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
      render: (_, customer) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => show('customers', customer.id)}
              size="small"
            />
          </Tooltip>
          
          {canEdit(customer) && (
            <Tooltip title="Edit Customer">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => edit('customers', customer.id)}
                size="small"
              />
            </Tooltip>
          )}
          
          {canDelete(customer) && (
            <Tooltip title="Delete Customer">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this customer?')) {
                    handleDelete(customer.id);
                  }
                }}
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
      data={customers}
      loading={loading}
      pagination={pagination}
      searchable={false}
      onSearch={onSearch}
    />
  );
};

export default CustomerTable;