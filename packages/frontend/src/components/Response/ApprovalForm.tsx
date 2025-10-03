import React, { useState } from 'react';
import { Form, Radio, Card, Space, Typography, Row, Col, Divider, Alert } from 'antd';
import { ButtonSubmit } from '../Button/Submit/ButtonSubmit';
import { ButtonCancel } from '../Button/Cancel/ButtonCancel';
import { InputText } from '../Input/Text/InputText';
import { StatusBadge } from '../Status/Badge/StatusBadge';
import { Response, Inquiry, Customer, ApproveResponseDto } from '../../types';

const { Text, Title, Paragraph } = Typography;
const { useForm: useAntdForm } = Form;

export interface ApprovalFormProps {
  response: Response;
  inquiry?: Inquiry;
  customer?: Customer;
  onApprove: (data: ApproveResponseDto) => Promise<void>;
  onReject: (data: ApproveResponseDto & { reason: string }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

type ApprovalAction = 'approve' | 'reject';

export const ApprovalForm: React.FC<ApprovalFormProps> = ({
  response,
  inquiry,
  customer,
  onApprove,
  onReject,
  onCancel,
  loading = false
}) => {
  const [form] = useAntdForm();
  const [action, setAction] = useState<ApprovalAction>('approve');

  const handleSubmit = async (values: any) => {
    try {
      const approvalData = {
        notes: values.notes || '',
      };

      if (action === 'approve') {
        await onApprove(approvalData);
      } else {
        await onReject({
          ...approvalData,
          reason: values.notes || 'No reason provided',
        });
      }
      
      form.resetFields();
    } catch (error) {
      console.error('Approval submission error:', error);
    }
  };

  const validateNotes = async (_: any, value: string) => {
    if (action === 'reject' && (!value || value.trim() === '')) {
      return Promise.reject(new Error('Rejection reason is required'));
    }
    return Promise.resolve();
  };

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Context Information */}
      <Card title="Review Context" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          {customer && (
            <Col xs={24} md={12}>
              <Title level={5}>Customer Information</Title>
              <Space direction="vertical" size="small">
                <Text><strong>Name:</strong> {customer.firstName} {customer.lastName}</Text>
                <Text><strong>Email:</strong> {customer.email}</Text>
                <Text><strong>Company:</strong> {customer.company || 'N/A'}</Text>
              </Space>
            </Col>
          )}
          
          {inquiry && (
            <Col xs={24} md={12}>
              <Title level={5}>Original Inquiry</Title>
              <Space direction="vertical" size="small">
                <Text><strong>Subject:</strong> {inquiry.subject}</Text>
                <Text><strong>Priority:</strong> {inquiry.priority}</Text>
                <StatusBadge status={inquiry.status}>Status: {inquiry.status}</StatusBadge>
                <Text><strong>Created:</strong> {new Date(inquiry.createdAt).toLocaleDateString()}</Text>
              </Space>
            </Col>
          )}
        </Row>

        {inquiry && (
          <>
            <Divider />
            <Title level={5}>Inquiry Description</Title>
            <Paragraph style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '12px', 
              borderRadius: '6px',
              marginBottom: 0
            }}>
              {inquiry.description}
            </Paragraph>
          </>
        )}
      </Card>

      {/* Response to Review */}
      <Card title="Response to Review" style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Text><strong>CSO:</strong> {response.responder.fullName}</Text>
            </Col>
            <Col span={12}>
              <Text><strong>Created:</strong> {new Date(response.createdAt).toLocaleDateString()}</Text>
            </Col>
          </Row>
          
          <StatusBadge status={response.status}>
            Status: {response.status}
          </StatusBadge>

          <Divider />
          <Title level={5}>Response Content</Title>
          <div style={{
            backgroundColor: '#e6f7ff',
            padding: '16px',
            borderRadius: '6px',
            border: '1px solid #91d5ff',
            whiteSpace: 'pre-wrap'
          }}>
            {response.responseText}
          </div>
        </Space>
      </Card>

      {/* Approval Decision Form */}
      <Card title="Manager Decision" style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={loading}
        >
          <Form.Item
            name="action"
            label="Decision"
            rules={[{ required: true, message: 'Please select an action' }]}
          >
            <Radio.Group 
              value={action} 
              onChange={(e) => setAction(e.target.value)}
              size="large"
            >
              <Radio.Button value="approve" style={{ marginRight: 16 }}>
                ✅ Approve Response
              </Radio.Button>
              <Radio.Button value="reject">
                ❌ Reject Response
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          {action === 'reject' && (
            <Alert
              message="Rejection requires a reason"
              description="Please provide clear feedback to help the CSO improve the response."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item
            name="notes"
            label={action === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason (Required)'}
            rules={[{ validator: validateNotes }]}
          >
            <InputText
              placeholder={
                action === 'approve'
                  ? 'Optional comments about the approval...'
                  : 'Please explain why this response needs to be revised...'
              }
              maxLength={500}
              showCount
              style={{ minHeight: 80 }}
            />
          </Form.Item>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <ButtonCancel onClick={onCancel} disabled={loading}>
              Cancel
            </ButtonCancel>
            <ButtonSubmit 
              loading={loading} 
              disabled={loading}
              style={{
                backgroundColor: action === 'approve' ? '#52c41a' : '#ff4d4f',
                borderColor: action === 'approve' ? '#52c41a' : '#ff4d4f'
              }}
            >
              {action === 'approve' ? '✅ Approve Response' : '❌ Reject Response'}
            </ButtonSubmit>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ApprovalForm;