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
  Tag,
  message
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { 
  useShow, 
  useNavigation, 
  useGetIdentity,
  useUpdate
} from '@refinedev/core';
import { useParams } from 'react-router';
import { StatusBadge } from '../../components/Status/Badge/StatusBadge';
import { Response, User, UserRole, ResponseStatus } from '../../types';

const { Title, Text, Paragraph } = Typography;

export const ResponseShow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { list, edit, show } = useNavigation();
  const { data: identity } = useGetIdentity<User>();

  const { query: { data: responseData, isLoading } } = useShow<Response>({
    resource: 'responses',
    id: id!,
  });

  const { mutate: updateResponse } = useUpdate();

  const response = responseData?.data;

  const canEdit = (response: Response): boolean => {
    if (!identity || !response) return false;
    // CSO can edit their own draft responses
    if (identity.role === UserRole.CSO) {
      return response.createdBy.id === identity.id && response.status === ResponseStatus.DRAFT;
    }
    return false;
  };

  const canApprove = (response: Response): boolean => {
    if (!identity || !response) return false;
    // Only managers can approve responses
    return identity.role === UserRole.MANAGER && response.status === ResponseStatus.PENDING_APPROVAL;
  };

  const handleApprove = async () => {
    if (!response) return;
    
    try {
      await updateResponse({
        resource: 'responses',
        id: response.id,
        values: {
          status: ResponseStatus.APPROVED,
        },
        successNotification: {
          message: 'Response approved successfully',
          type: 'success',
        },
      });
    } catch (error) {
      message.error('Failed to approve response');
    }
  };

  const handleReject = async () => {
    if (!response) return;
    
    try {
      await updateResponse({
        resource: 'responses',
        id: response.id,
        values: {
          status: ResponseStatus.REJECTED,
        },
        successNotification: {
          message: 'Response rejected',
          type: 'success',
        },
      });
    } catch (error) {
      message.error('Failed to reject response');
    }
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

  const getStatusColor = (status: ResponseStatus): string => {
    switch (status) {
      case ResponseStatus.DRAFT: return 'default';
      case ResponseStatus.PENDING_APPROVAL: return 'processing';
      case ResponseStatus.APPROVED: return 'success';
      case ResponseStatus.REJECTED: return 'error';
      case ResponseStatus.SENT: return 'success';
      default: return 'default';
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!response) {
    return <div>Response not found</div>;
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
                onClick={() => list('responses')}
              >
                Back to Responses
              </Button>
              <Title level={2} style={{ margin: 0 }}>
                Response Details
              </Title>
              <Text type="secondary">
                ID: {response.id.slice(0, 8)}...
              </Text>
            </Space>
          </Col>
          <Col>
            <Space>
              {canEdit(response) && (
                <Button
                  type="default"
                  icon={<EditOutlined />}
                  onClick={() => edit('responses', response.id)}
                >
                  Edit Response
                </Button>
              )}
              {canApprove(response) && (
                <Space>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={handleApprove}
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                  >
                    Approve
                  </Button>
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    onClick={handleReject}
                  >
                    Reject
                  </Button>
                </Space>
              )}
              {response.inquiry && (
                <Button
                  type="default"
                  icon={<EyeOutlined />}
                  onClick={() => show('inquiries', response.inquiry.id)}
                >
                  View Inquiry
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </div>

      <Row gutter={[24, 24]}>
        {/* Main Content */}
        <Col xs={24} lg={16}>
          <Card title="Response Information">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Title level={4} style={{ margin: 0 }}>
                    Response Message
                  </Title>
                  <StatusBadge status={response.status} />
                </div>
              </div>

              <div>
                <Paragraph style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: 16, 
                  borderRadius: 6,
                  whiteSpace: 'pre-wrap',
                  minHeight: 100
                }}>
                  {response.message}
                </Paragraph>
              </div>

              {response.internalNotes && (identity?.role === UserRole.MANAGER || response.createdBy.id === identity?.id) && (
                <>
                  <Divider />
                  <div>
                    <Title level={5}>Internal Notes</Title>
                    <div style={{ 
                      backgroundColor: '#fff3cd', 
                      padding: 16, 
                      borderRadius: 6,
                      borderLeft: '4px solid #ffc107',
                      whiteSpace: 'pre-wrap'
                    }}>
                      <Text>{response.internalNotes}</Text>
                    </div>
                  </div>
                </>
              )}

              {response.inquiry && (
                <>
                  <Divider />
                  <div>
                    <Title level={5}>Related Inquiry</Title>
                    <Card size="small" style={{ backgroundColor: '#fafafa' }}>
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text strong>{response.inquiry.subject}</Text>
                          <Button 
                            type="link" 
                            size="small"
                            onClick={() => show('inquiries', response.inquiry.id)}
                          >
                            View Full Inquiry
                          </Button>
                        </div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Category: {response.inquiry.category?.replace('_', ' ').toUpperCase()}
                        </Text>
                        <Paragraph 
                          ellipsis={{ rows: 3, expandable: true }}
                          style={{ marginBottom: 0, fontSize: '14px' }}
                        >
                          {response.inquiry.description}
                        </Paragraph>
                      </Space>
                    </Card>
                  </div>
                </>
              )}
            </Space>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Response Status */}
            <Card title="Response Status" size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Status">
                  <Tag color={getStatusColor(response.status)}>
                    {response.status.replace('_', ' ').toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                  {formatDate(response.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Last Updated">
                  {formatDate(response.updatedAt)}
                </Descriptions.Item>
                {response.approvedAt && (
                  <Descriptions.Item label="Approved">
                    {formatDate(response.approvedAt)}
                  </Descriptions.Item>
                )}
                {response.sentAt && (
                  <Descriptions.Item label="Sent">
                    {formatDate(response.sentAt)}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Creator Information */}
            <Card title="Created By" size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Name">
                  <Text strong>
                    {response.createdBy.firstName} {response.createdBy.lastName}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Role">
                  <Tag>{response.createdBy.role}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  <Text copyable>{response.createdBy.email}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Approver Information */}
            {response.approvedBy && (
              <Card title="Approved By" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Name">
                    <Text strong>
                      {response.approvedBy.firstName} {response.approvedBy.lastName}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Role">
                    <Tag>{response.approvedBy.role}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    <Text copyable>{response.approvedBy.email}</Text>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default ResponseShow;