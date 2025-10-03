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
  useUpdate
} from '@refinedev/core';
import { useParams } from 'react-router';
import { ResponseForm } from '../../components/Response/ResponseForm';
import { Response, User, UserRole, CreateResponseDto, ResponseStatus } from '../../types';

const { Title } = Typography;

export const ResponseEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { list, show } = useNavigation();
  const { data: identity } = useGetIdentity<User>();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { query: { data: responseData, isLoading } } = useShow<Response>({
    resource: 'responses',
    id: id!,
    queryOptions: {
      enabled: !!id,
    },
  });

  const { mutate: updateResponse } = useUpdate();

  const response = responseData?.data;

  useEffect(() => {
    if (!id) {
      message.error('No response ID provided');
      list('responses');
    }
  }, [id, list]);

  const canEdit = (response: Response): boolean => {
    if (!identity || !response) return false;
    // CSO can edit their own draft responses
    if (identity.role === UserRole.CSO) {
      return response.responder.id === identity.id && response.status === ResponseStatus.DRAFT;
    }
    return false;
  };

  const handleSubmit = async (values: CreateResponseDto) => {
    if (!response || !canEdit(response)) {
      message.error('You are not authorized to edit this response');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateResponse({
        resource: 'responses',
        id: response.id,
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
      
      // Navigate back to the response details
      show('responses', response.id);
    } catch (error) {
      message.error('Failed to submit response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async (values: CreateResponseDto) => {
    if (!response || !canEdit(response)) {
      message.error('You are not authorized to edit this response');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateResponse({
        resource: 'responses',
        id: response.id,
        values: {
          ...values,
          status: ResponseStatus.DRAFT, // Save as draft
        },
        successNotification: {
          message: 'Draft response updated successfully',
          type: 'success',
        },
        errorNotification: {
          message: 'Failed to save draft',
          type: 'error',
        },
      });
      
      // Navigate back to the response details
      show('responses', response.id);
    } catch (error) {
      message.error('Failed to save draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (response) {
      show('responses', response.id);
    } else {
      list('responses');
    }
  };

  if (isLoading) {
    return <div>Loading response...</div>;
  }

  if (!response) {
    return <div>Response not found</div>;
  }

  if (!canEdit(response)) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <Title level={3}>Access Denied</Title>
          <p>You can only edit draft responses that you created.</p>
          <Button type="primary" onClick={() => show('responses', response.id)}>
            Back to Response
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
                onClick={() => show('responses', response.id)}
              >
                Back to Response
              </Button>
              <Title level={2} style={{ margin: 0 }}>
                Edit Draft Response
              </Title>
              <Typography.Text type="secondary">
                ID: {response.id.slice(0, 8)}...
              </Typography.Text>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Response Form */}
      <ResponseForm
        inquiry={undefined} // Simplified for edit mode - inquiry info not needed for editing
        initialValues={{
          responseText: response.responseText,
          inquiryId: response.inquiry?.id
        }}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        onCancel={handleCancel}
        loading={isSubmitting}
        mode="edit"
      />
    </div>
  );
};

export default ResponseEdit;