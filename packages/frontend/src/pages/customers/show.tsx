import React from 'react';
import { 
  Card, 
  Typography, 
  Descriptions, 
  Button, 
  Space, 
  Tag, 
  Spin,
  Row,
  Col,
  Divider
} from 'antd';
import { 
  EditOutlined, 
  ArrowLeftOutlined, 
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  BankOutlined
} from '@ant-design/icons';
import { useOne, useNavigation, useGetIdentity } from '@refinedev/core';
import { useParams } from 'react-router';
import { Customer, User, UserRole } from '../../types';

const { Title, Text } = Typography;

export const CustomerShow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { list, edit } = useNavigation();
  const { data: identity } = useGetIdentity<User>();

  const { 
    query: { data: customerData, isLoading }
  } = useOne<Customer>({
    resource: 'customers',
    id: id!,
  });

  const customer = customerData?.data;

  const canEdit = (customer: Customer): boolean => {
    if (!identity) return false;
    // CSO can edit assigned customers, Manager can edit all
    if (identity.role === UserRole.CSO) {
      return customer.assignedTo?.id === identity.id;
    }
    return identity.role === UserRole.MANAGER;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Loading customer details...</Text>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Text type="danger">Customer not found</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => list('customers')}
              >
                Back to Customers
              </Button>
              <Title level={2} style={{ margin: 0 }}>
                {customer.firstName} {customer.lastName}
              </Title>
            </Space>
          </Col>
          <Col>
            {canEdit(customer) && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => edit('customers', id!)}
              >
                Edit Customer
              </Button>
            )}
          </Col>
        </Row>
      </div>

      <Row gutter={24}>
        {/* Basic Information */}
        <Col xs={24} lg={16}>
          <Card title={
            <Space>
              <UserOutlined />
              <span>Basic Information</span>
            </Space>
          }>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Full Name">
                <Text strong>{customer.firstName} {customer.lastName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Email" labelStyle={{ width: '150px' }}>
                <Space>
                  <MailOutlined />
                  <Text copyable>{customer.email}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {customer.phone ? (
                  <Space>
                    <PhoneOutlined />
                    <Text copyable>{customer.phone}</Text>
                  </Space>
                ) : (
                  <Text type="secondary">Not provided</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Company">
                {customer.company ? (
                  <Space>
                    <BankOutlined />
                    <Text>{customer.company}</Text>
                  </Space>
                ) : (
                  <Text type="secondary">Not provided</Text>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Notes */}
          {customer.notes && (
            <Card title="Notes" style={{ marginTop: 16 }}>
              <Text>{customer.notes}</Text>
            </Card>
          )}
        </Col>

        {/* Sidebar Information */}
        <Col xs={24} lg={8}>
          <Card title="Assignment & Tracking">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text type="secondary">Assigned To:</Text>
                <br />
                {customer.assignedTo ? (
                  <Space>
                    <UserOutlined />
                    <Text strong>
                      {customer.assignedTo.firstName} {customer.assignedTo.lastName}
                    </Text>
                  </Space>
                ) : (
                  <Tag color="orange">Unassigned</Tag>
                )}
              </div>

              <Divider />

              <div>
                <Text type="secondary">Created At:</Text>
                <br />
                <Text>{formatDate(customer.createdAt)}</Text>
              </div>

              <Divider />

              <div>
                <Text type="secondary">Customer ID:</Text>
                <br />
                <Text code copyable>
                  {customer.id}
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CustomerShow;