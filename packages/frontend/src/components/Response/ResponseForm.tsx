import React from 'react';
import { Form, Input, Space, Card, Typography, Divider } from 'antd';
import { ButtonPrimary } from '../Button/Primary/ButtonPrimary';
import { ButtonSecondary } from '../Button/Secondary/ButtonSecondary';
import { ButtonCancel } from '../Button/Cancel/ButtonCancel';
import { CreateResponseDto, Inquiry } from '../../types';

const { TextArea } = Input;
const { Title, Text } = Typography;

export interface ResponseFormProps {
  inquiry?: Inquiry;
  initialValues?: Partial<CreateResponseDto>;
  onSubmit: (values: CreateResponseDto) => void;
  onSaveDraft: (values: CreateResponseDto) => void;
  onCancel: () => void;
  loading?: boolean;
  mode?: 'create' | 'edit';
}

export const ResponseForm: React.FC<ResponseFormProps> = ({
  inquiry,
  initialValues,
  onSubmit,
  onSaveDraft,
  onCancel,
  loading = false,
  mode = 'create'
}) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    const responseData: CreateResponseDto = {
      responseText: values.responseText,
      inquiryId: inquiry?.id || values.inquiryId
    };
    onSubmit(responseData);
  };

  const handleSaveDraft = () => {
    form.validateFields(['responseText']).then((values) => {
      const responseData: CreateResponseDto = {
        responseText: values.responseText,
        inquiryId: inquiry?.id || values.inquiryId
      };
      onSaveDraft(responseData);
    });
  };

  const getCustomerName = (inquiry: Inquiry): string => {
    if (inquiry.customer) {
      return `${inquiry.customer.firstName} ${inquiry.customer.lastName}`;
    }
    return 'Unknown Customer';
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {inquiry && (
        <Card style={{ marginBottom: 24 }}>
          <Title level={4}>Original Inquiry</Title>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div>
              <Text strong>Customer: </Text>
              <Text>{getCustomerName(inquiry)}</Text>
            </div>
            <div>
              <Text strong>Subject: </Text>
              <Text>{inquiry.subject}</Text>
            </div>
            <div>
              <Text strong>Description:</Text>
            </div>
            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: 16, 
              borderRadius: 6,
              marginTop: 8
            }}>
              <Text>{inquiry.message}</Text>
            </div>
          </Space>
        </Card>
      )}

      <Card>
        <Title level={4}>
          {mode === 'create' ? 'Create Response' : 'Edit Response'}
        </Title>
        
        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="message"
            label="Response Message"
            rules={[
              { required: true, message: 'Please enter your response message' },
              { min: 10, message: 'Response message must be at least 10 characters long' }
            ]}
          >
            <TextArea
              rows={8}
              placeholder="Enter your response to the customer..."
              showCount
              maxLength={2000}
            />
          </Form.Item>

          <Divider />

          <Form.Item
            name="internalNotes"
            label="Internal Notes (Optional)"
            help="These notes are only visible to CSOs and Managers"
          >
            <TextArea
              rows={4}
              placeholder="Add any internal notes or context..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <ButtonPrimary
                htmlType="submit"
                loading={loading}
              >
                Submit for Approval
              </ButtonPrimary>
              
              <ButtonSecondary
                onClick={handleSaveDraft}
                loading={loading}
              >
                Save as Draft
              </ButtonSecondary>
              
              <ButtonCancel onClick={onCancel}>
                Cancel
              </ButtonCancel>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ResponseForm;