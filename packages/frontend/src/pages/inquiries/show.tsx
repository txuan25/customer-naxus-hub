import React from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
  Row, 
  Col, 
  Descriptions, 
  Divider,
  Tag
} from 'antd';
import { 
  ArrowLeftOutlined, 
  MessageOutlined, 
  EditOutlined 
} from '@ant-design/icons';
import { 
  useShow, 
  useNavigation, 
  useGetIdentity,
  useCreate 
} from '@refinedev/core';
import { useParams, useNavigate } from 'react-router';
import { StatusBadge, PriorityBadge } from '../../components/Status/Badge/StatusBadge';
import { Inquiry, User, UserRole, InquiryStatus } from '../../types';

const { Title, Text, Paragraph } = Typography;

export const InquiryShow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { list } = useNavigation();
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<User>();

  const { query: { data: inquiryData, isLoading } } = useShow<Inquiry>({
    resource: 'inquiries',
    id: id!,
  });

  const inquiry = inquiryData?.data;

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

  const handleCreateResponse = () => {
    navigate(`/responses/create?inquiryId=${id}`);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!inquiry) {
    return <div>Inquiry not found</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={0}>
              <Button 
                type="text" 
                icon={<ArrowLeftOutlined />}
                onClick={() => list('inquiries')}
              >
                Back to Inquiries
              </Button>
              <Title level={2} style={{ margin: 0 }}>
                Inquiry Details
              </Title>
              <Text type="secondary">
                ID: {inquiry.id.slice(0, 8)}...
              </Text>
            </Space>
          </Col>
          <Col>
            <Space>
              {canCreateResponse(inquiry) && (
                <Button
                  type="primary"
                  icon={<MessageOutlined />}
                  onClick={handleCreateResponse}
                >
                  Create Response
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </div>

      <Row gutter={[24, 24]}>
        {/* Main Content */}
        <Col xs={24} lg={16}>
          <Card title="Inquiry Information">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={4} style={{ marginBottom: 8 }}>
                  {inquiry.subject}
                </Title>
                <Space size="middle">
                  <PriorityBadge priority={inquiry.priority} />
                  <StatusBadge status={inquiry.status} />
                  <Tag>{inquiry.category.replace('_', ' ').toUpperCase()}</Tag>
                </Space>
              </div>

              <Divider />

              <div>
                <Title level={5}>Description</Title>
                <Paragraph style={{
                  backgroundColor: '#f5f5f5',
                  padding: 16,
                  borderRadius: 6,
                  whiteSpace: 'pre-wrap'
                }}>
                  {inquiry.message}
                </Paragraph>
              </div>

              {inquiry.responses && inquiry.responses.length > 0 && (
                <>
                  <Divider />
                  <div>
                    <Title level={5}>Response History</Title>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      {inquiry.responses.map((response, index) => (
                        <Card 
                          key={response.id} 
                          size="small"
                          style={{ backgroundColor: '#fafafa' }}
                        >
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text strong>
                                Response by {response.responder.firstName} {response.responder.lastName}
                              </Text>
                              <Space>
                                <StatusBadge status={response.status} />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  {formatDate(response.createdAt)}
                                </Text>
                              </Space>
                            </div>
                            <Paragraph style={{ marginBottom: 0 }}>
                              {response.responseText}
                            </Paragraph>
                          </Space>
                        </Card>
                      ))}
                    </Space>
                  </div>
                </>
              )}
            </Space>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Customer Information */}
            <Card title="Customer Information" size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Name">
                  <Text strong>{getCustomerName(inquiry)}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  <Text copyable>{inquiry.customer?.email}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  {inquiry.customer?.phone || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Company">
                  {inquiry.customer?.company || '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Assignment Information */}
            <Card title="Assignment" size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Assigned To">
                  {inquiry.assignee ? (
                    <Text>{inquiry.assignee.firstName} {inquiry.assignee.lastName}</Text>
                  ) : (
                    <Text type="secondary">Unassigned</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                  {formatDate(inquiry.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Last Updated">
                  {formatDate(inquiry.updatedAt)}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default InquiryShow;