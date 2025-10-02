import React from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Row,
  Col
} from 'antd';
import {
  ReloadOutlined
} from '@ant-design/icons';
import {
  useList,
  useNavigation,
  useGetIdentity
} from '@refinedev/core';
import { InquiryTable } from '../../components/Inquiry/InquiryTable';
import { Inquiry, User, UserRole } from '../../types';

const { Title } = Typography;

export const InquiryList: React.FC = () => {
  const { data: identity } = useGetIdentity<User>();

  const {
    query: { data: inquiryData, isLoading, refetch }
  } = useList({
    resource: 'inquiries',
  });

  const inquiries = (inquiryData?.data || []) as Inquiry[];
  const total = inquiryData?.total || 0;

  const handleRefresh = () => {
    refetch();
  };

  const getPageTitle = () => {
    if (identity?.role === UserRole.CSO) {
      return 'My Inquiries';
    }
    return 'All Inquiries';
  };

  const getPageDescription = () => {
    if (identity?.role === UserRole.CSO) {
      return 'Manage inquiries assigned to you';
    }
    return 'Manage all customer inquiries in the system';
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

      {/* Inquiry Table */}
      <Card>
        <InquiryTable
          inquiries={inquiries}
          loading={isLoading}
          pagination={{
            current: 1,
            pageSize: 25,
            total: total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '25', '50', '100'],
          }}
        />
      </Card>
    </div>
  );
};

export default InquiryList;