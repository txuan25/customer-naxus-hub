import React, { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Row,
  Col,
  message
} from 'antd';
import {
  ArrowLeftOutlined
} from '@ant-design/icons';
import {
  useShow,
  useNavigation,
  useGetIdentity,
  useCreate
} from '@refinedev/core';
import { useParams, useSearchParams } from 'react-router';
import { ResponseForm } from '../../components/Response/ResponseForm';
import { Inquiry, User, UserRole, CreateResponseDto, ResponseStatus } from '../../types';

const { Title } = Typography;

export const ResponseCreate: React.FC = () => {
  const { list, show } = useNavigation();
  const { data: identity } = useGetIdentity<User>();
  const [searchParams] = useSearchParams();
  const inquiryId = searchParams.get('inquiryId');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { query: { data: inquiryData, isLoading } } = useShow<Inquiry>({
    resource: 'inquiries',
    id: inquiryId!,
    queryOptions: {
      enabled: !!inquiryId,
    },
  });

  const { mutate: createResponse } = useCreate();

  const inquiry = inquiryData?.data;

  useEffect(() => {
    if (!inquiryId) {
      message.error('No inquiry ID provided');
      list('inquiries');
    }
  }, [inquiryId, list]);

  const canCreateResponse = (inquiry: Inquiry): boolean => {
    if (!identity || !inquiry) return false;
    // CSO can create responses for assigned inquiries, Manager can create for all
    if (identity.role === UserRole.CSO) {
      return inquiry.assignedTo?.id === identity.id;
    }
    return identity.role === UserRole.MANAGER;
  };

  const handleSubmit = async (values: CreateResponseDto) => {
    if (!inquiry || !canCreateResponse(inquiry)) {
      message.error('You are not authorized to create a response for this inquiry');
      return;
    }

    setIsSubmitting(true);
    try {
      await createResponse({
        resource: 'responses',
        values: {
          ...values,
          status: ResponseStatus.PENDING_APPROVAL, // Submit for approval
        },
        successNotification: {
          message: 'Response submitted for approval successfully',
          type: 'success',
        },
        errorNotification: {
          message: 'Failed to submit response',
          type: 'error',
        },
      });
      
      // Navigate back to the inquiry details
      show('inquiries', inquiryId!);
    } catch (error) {
      message.error('Failed to submit response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async (values: CreateResponseDto) => {
    if (!inquiry || !canCreateResponse(inquiry)) {
      message.error('You are not authorized to create a response for this inquiry');
      return;
    }

    setIsSubmitting(true);
    try {
      await createResponse({
        resource: 'responses',
        values: {
          ...values,
          status: ResponseStatus.DRAFT, // Save as draft
        },
        successNotification: {
          message: 'Response saved as draft',
          type: 'success',
        },
        errorNotification: {
          message: 'Failed to save draft',
          type: 'error',
        },
      });
      
      // Navigate back to the inquiry details
      show('inquiries', inquiryId!);
    } catch (error) {
      message.error('Failed to save draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (inquiryId) {
      show('inquiries', inquiryId);
    } else {
      list('inquiries');
    }
  };

  if (isLoading) {
    return <div>Loading inquiry...</div>;
  }

  if (!inquiry) {
    return <div>Inquiry not found</div>;
  }

  if (!canCreateResponse(inquiry)) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <Title level={3}>Access Denied</Title>
          <p>You are not authorized to create a response for this inquiry.</p>
          <Button type="primary" onClick={() => show('inquiries', inquiryId!)}>
            Back to Inquiry
          </Button>
        </Card>
      </div>
    );
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
                onClick={() => show('inquiries', inquiryId!)}
              >
                Back to Inquiry
              </Button>
              <Title level={2} style={{ margin: 0 }}>
                Create Response
              </Title>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Response Form */}
      <ResponseForm
        inquiry={inquiry}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        onCancel={handleCancel}
        loading={isSubmitting}
        mode="create"
      />
    </div>
  );
};

export default ResponseCreate;