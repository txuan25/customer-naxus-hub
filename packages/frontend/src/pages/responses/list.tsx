import React, { useState } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Row,
  Col,
  message,
  Badge
} from 'antd';
import {
  ReloadOutlined,
  FilterOutlined,
  ClearOutlined
} from '@ant-design/icons';
import {
  useList,
  useGetIdentity,
  CrudFilter
} from '@refinedev/core';
import { ResponseTable } from '../../components/Response/ResponseTable';
import { Response, User, UserRole, ResponseStatus } from '../../types';
import { responseActions } from '../../dataProvider';

const { Title } = Typography;

export const ResponseList: React.FC = () => {
  const { data: identity } = useGetIdentity<User>();
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Prepare filters for API-based filtering
  const filters: CrudFilter[] = showPendingOnly
    ? [{ field: 'status', operator: 'eq' as const, value: ResponseStatus.PENDING_APPROVAL }]
    : [];

  const {
    query: { data: responseData, isLoading, refetch }
  } = useList({
    resource: 'responses',
    filters,
    pagination: {
      current,
      pageSize,
      mode: 'server',
    } as any,
    meta: {
      populate: ['inquiry', 'responder', 'approvedBy']
    },
    queryOptions: {
      // Force re-fetch when filters or pagination change
      refetchOnWindowFocus: false,
      queryKey: ['responses', filters, current, pageSize],
    },
  });

  const responses = (responseData?.data || []) as Response[];
  const total = responseData?.total || 0;

  const handleRefresh = () => {
    refetch();
  };

  const handleToggleFilter = () => {
    setShowPendingOnly(!showPendingOnly);
  };

  const handleApprove = async (id: string, notes?: string) => {
    try {
      await responseActions.approve(id, notes);
      message.success('Response approved successfully');
      refetch(); // Refresh the list to show updated status
    } catch (error) {
      message.error('Failed to approve response');
    }
  };

  const handleReject = async (id: string, reason?: string) => {
    try {
      await responseActions.reject(id, reason || 'No reason provided');
      message.success('Response rejected');
      refetch(); // Refresh the list to show updated status
    } catch (error) {
      message.error('Failed to reject response');
    }
  };

  const getPageTitle = () => {
    if (identity?.role === UserRole.CSO) {
      return 'My Responses';
    }
    if (identity?.role === UserRole.MANAGER) {
      return 'Response Management';
    }
    return 'All Responses';
  };

  const getPageDescription = () => {
    if (identity?.role === UserRole.CSO) {
      return 'Manage responses you have created';
    }
    if (identity?.role === UserRole.MANAGER) {
      return 'Review and approve customer responses';
    }
    return 'Manage all customer responses in the system';
  };

  const getPendingCount = () => {
    // If showing pending only, return the current total, otherwise make a separate count
    if (showPendingOnly) {
      return total;
    }
    return responses.filter(r => r.status === ResponseStatus.PENDING_APPROVAL).length;
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={2} style={{ margin: 0 }}>
                {getPageTitle()}
              </Title>
              <Typography.Text type="secondary">
                {getPageDescription()}
              </Typography.Text>
            </Space>
          </Col>
          <Col>
            <Space>
              {identity?.role === UserRole.MANAGER && (
                <>
                  <Typography.Text type="secondary">
                    Pending Approval: {getPendingCount()}
                  </Typography.Text>
                  <Button
                    type={showPendingOnly ? 'primary' : 'default'}
                    icon={showPendingOnly ? <ClearOutlined /> : <FilterOutlined />}
                    onClick={handleToggleFilter}
                  >
                    {showPendingOnly ? 'Show All' : 'Pending Only'}
                  </Button>
                </>
              )}
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={isLoading}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Response Table */}
      <Card>
        <ResponseTable
          responses={responses}
          loading={isLoading}
          pagination={{
            current,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '25', '50', '100'],
            onChange: (page, size) => {
              setCurrent(page);
              if (size) setPageSize(size);
            },
          }}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </Card>
    </div>
  );
};