import React, { useState } from 'react';
import { Space, Button, Typography, Tooltip, Modal, Input, message } from 'antd';
import { EyeOutlined, CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigation, useGetIdentity, useUpdate } from '@refinedev/core';
import type { ColumnsType } from 'antd/es/table';
import { Response, User, UserRole, ResponseStatus, ApproveResponseDto } from '../../types';
import { DataTable } from '../DataTable/DataTable';
import { StatusBadge } from '../Status/Badge/StatusBadge';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

export interface ResponseTableProps {
  responses: Response[];
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
  onApprove?: (id: string, notes?: string) => void;
  onReject?: (id: string, notes?: string) => void;
}

export const ResponseTable: React.FC<ResponseTableProps> = ({
  responses,
  loading = false,
  pagination,
  onSearch,
  onApprove,
  onReject
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

  const { show, edit } = navigation;
  const { data: identity } = identityHook;
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'approve' | 'reject'>('approve');
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);
  const [notes, setNotes] = useState('');

  const canApprove = (response: Response): boolean => {
    if (!identity) return false;
    return identity.role === UserRole.MANAGER && 
           response.status === ResponseStatus.PENDING_APPROVAL;
  };

  const canEdit = (response: Response): boolean => {
    if (!identity) return false;
    // CSO can edit their own draft responses
    if (identity.role === UserRole.CSO) {
      return response.createdBy.id === identity.id && 
             response.status === ResponseStatus.DRAFT;
    }
    return false;
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

  const getCustomerName = (response: Response): string => {
    if (response.inquiry?.customer) {
      return `${response.inquiry.customer.firstName} ${response.inquiry.customer.lastName}`;
    }
    return 'Unknown Customer';
  };

  const handleApproval = (response: Response, type: 'approve' | 'reject') => {
    setSelectedResponse(response);
    setModalType(type);
    setNotes('');
    setModalVisible(true);
  };

  const handleModalOk = () => {
    if (!selectedResponse) return;
    
    if (modalType === 'approve' && onApprove) {
      onApprove(selectedResponse.id, notes);
    } else if (modalType === 'reject' && onReject) {
      onReject(selectedResponse.id, notes);
    }
    
    setModalVisible(false);
    setSelectedResponse(null);
    setNotes('');
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedResponse(null);
    setNotes('');
  };

  const truncateText = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const columns: ColumnsType<Response> = [
    {
      title: 'Customer',
      key: 'customer',
      render: (_, response) => (
        <Space direction="vertical" size={0}>
          <Text strong>{getCustomerName(response)}</Text>
          {response.inquiry?.subject && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {truncateText(response.inquiry.subject, 30)}
            </Text>
          )}
        </Space>
      ),
      sorter: (a, b) => getCustomerName(a).localeCompare(getCustomerName(b)),
    },
    {
      title: 'CSO',
      key: 'createdBy',
      render: (_, response) => (
        <Space direction="vertical" size={0}>
          <Text>{response.createdBy.firstName} {response.createdBy.lastName}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {response.createdBy.email}
          </Text>
        </Space>
      ),
      sorter: (a, b) => 
        `${a.createdBy.firstName} ${a.createdBy.lastName}`
          .localeCompare(`${b.createdBy.firstName} ${b.createdBy.lastName}`),
    },
    {
      title: 'Response Preview',
      key: 'message',
      width: 300,
      render: (_, response) => (
        <div style={{ maxWidth: 280 }}>
          <Paragraph
            ellipsis={{
              rows: 3,
              expandable: true,
              symbol: 'more',
              onExpand: (event) => event.stopPropagation()
            }}
            style={{
              marginBottom: 4,
              fontSize: '14px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {response.message}
          </Paragraph>
          {response.internalNotes && (
            <Paragraph
              type="secondary"
              style={{ fontSize: '12px', marginBottom: 0 }}
              ellipsis={{
                rows: 2,
                expandable: true,
                symbol: 'more',
                onExpand: (event) => event.stopPropagation()
              }}
            >
              <Text strong>Internal: </Text>
              {response.internalNotes}
            </Paragraph>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: ResponseStatus) => (
        <StatusBadge status={status} />
      ),
      filters: Object.values(ResponseStatus).map(status => ({
        text: status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        value: status,
      })),
      onFilter: (value, record) => record.status === value,
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
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (_, response) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => show('responses', response.id)}
              size="small"
            />
          </Tooltip>
          
          {canEdit(response) && (
            <Tooltip title="Edit Response">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => edit('responses', response.id)}
                size="small"
              />
            </Tooltip>
          )}
          
          {canApprove(response) && (
            <>
              <Tooltip title="Approve Response">
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  onClick={() => handleApproval(response, 'approve')}
                  size="small"
                  style={{ color: '#52c41a' }}
                />
              </Tooltip>
              
              <Tooltip title="Reject Response">
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={() => handleApproval(response, 'reject')}
                  size="small"
                  danger
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={responses}
        loading={loading}
        pagination={pagination}
        searchable={true}
        onSearch={onSearch}
      />

      <Modal
        title={`${modalType === 'approve' ? 'Approve' : 'Reject'} Response`}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={modalType === 'approve' ? 'Approve' : 'Reject'}
        okButtonProps={{ 
          danger: modalType === 'reject',
          type: modalType === 'approve' ? 'primary' : 'default'
        }}
      >
        {selectedResponse && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text strong>Customer: </Text>
              <Text>{getCustomerName(selectedResponse)}</Text>
            </div>
            <div>
              <Text strong>CSO: </Text>
              <Text>{selectedResponse.createdBy.firstName} {selectedResponse.createdBy.lastName}</Text>
            </div>
            <div>
              <Text strong>Response Message:</Text>
              <div style={{ 
                backgroundColor: '#f5f5f5', 
                padding: 12, 
                borderRadius: 6,
                marginTop: 8
              }}>
                <Text>{selectedResponse.message}</Text>
              </div>
            </div>
            {selectedResponse.internalNotes && (
              <div>
                <Text strong>Internal Notes:</Text>
                <div style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: 12, 
                  borderRadius: 6,
                  marginTop: 8
                }}>
                  <Text>{selectedResponse.internalNotes}</Text>
                </div>
              </div>
            )}
            <div>
              <Text strong>
                {modalType === 'approve' ? 'Approval' : 'Rejection'} Notes (Optional):
              </Text>
              <TextArea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={`Add notes for this ${modalType}...`}
                style={{ marginTop: 8 }}
              />
            </div>
          </Space>
        )}
      </Modal>
    </>
  );
};

export default ResponseTable;