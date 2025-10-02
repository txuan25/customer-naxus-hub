import React, { useState } from 'react';
import { Typography, message, Spin, Card } from 'antd';
import { useOne, useUpdate, useNavigation } from '@refinedev/core';
import { useParams } from 'react-router';
// CustomerForm removed - using simple placeholder
import { Customer, UpdateCustomerDto } from '../../types';

const { Title } = Typography;

export const CustomerEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { mutate: updateCustomer } = useUpdate();
  const { list, show } = useNavigation();
  const [loading, setLoading] = useState(false);

  const { 
    query: { data: customerData, isLoading: isLoadingCustomer }
  } = useOne<Customer>({
    resource: 'customers',
    id: id!,
  });

  const customer = customerData?.data;

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await updateCustomer({
        resource: 'customers',
        id: id!,
        values,
      });
      message.success('Customer updated successfully!');
      show('customers', id!);
    } catch (error) {
      message.error('Failed to update customer. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    list('customers');
  };

  if (isLoadingCustomer) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Typography.Text>Loading customer details...</Typography.Text>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Typography.Text type="danger">Customer not found</Typography.Text>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Edit Customer
        </Title>
        <Typography.Text type="secondary">
          Update customer information
        </Typography.Text>
      </div>

      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Title level={4}>Customer Edit Form</Title>
          <Typography.Text type="secondary">
            CustomerForm component has been removed. This is a placeholder for the customer editing interface.
          </Typography.Text>
          <div style={{ marginTop: 16 }}>
            <Typography.Text>
              Editing customer: {customer.firstName} {customer.lastName}
            </Typography.Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CustomerEdit;