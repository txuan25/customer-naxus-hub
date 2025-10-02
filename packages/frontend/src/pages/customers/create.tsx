import React, { useState } from 'react';
import { Card, Typography, message } from 'antd';
import { useCreate, useNavigation } from '@refinedev/core';
// CustomerForm removed - using simple placeholder
import { CreateCustomerDto } from '../../types';

const { Title } = Typography;

export const CustomerCreate: React.FC = () => {
  const { mutate: createCustomer } = useCreate();
  const { list } = useNavigation();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await createCustomer({
        resource: 'customers',
        values,
      });
      message.success('Customer created successfully!');
      list('customers');
    } catch (error) {
      message.error('Failed to create customer. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    list('customers');
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Create New Customer
        </Title>
        <Typography.Text type="secondary">
          Add a new customer to the system
        </Typography.Text>
      </div>

      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Title level={4}>Customer Create Form</Title>
          <Typography.Text type="secondary">
            CustomerForm component has been removed. This is a placeholder for the customer creation interface.
          </Typography.Text>
        </div>
      </Card>
    </div>
  );
};

export default CustomerCreate;