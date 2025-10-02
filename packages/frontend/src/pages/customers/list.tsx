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
  PlusOutlined, 
  ReloadOutlined 
} from '@ant-design/icons';
import { 
  useList, 
  useNavigation, 
  useGetIdentity 
} from '@refinedev/core';
import { CustomerTable } from '../../components/Customer/CustomerTable';
import { Customer, User, UserRole } from '../../types';

const { Title } = Typography;

export const CustomerList: React.FC = () => {
  const { create } = useNavigation();
  const { data: identity } = useGetIdentity<User>();

  const {
    query: { data: customerData, isLoading, refetch }
  } = useList({
    resource: 'customers',
  });

  const customers = (customerData?.data || []) as any[];
  const total = customerData?.total || 0;

  const handleRefresh = () => {
    refetch();
  };

  const getPageTitle = () => {
    if (identity?.role === UserRole.CSO) {
      return 'My Customers';
    }
    return 'All Customers';
  };

  const getPageDescription = () => {
    if (identity?.role === UserRole.CSO) {
      return 'Manage customers assigned to you';
    }
    return 'Manage all customers in the system';
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
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => create('customers')}
              >
                Add Customer
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Customer Table */}
      <Card>
        <CustomerTable
          customers={customers}
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

export default CustomerList;