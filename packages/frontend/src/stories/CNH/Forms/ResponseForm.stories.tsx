import type { Meta, StoryObj } from '@storybook/react-vite';
import { ResponseForm } from '../../../components/Response/ResponseForm';
import { Inquiry, InquiryStatus, InquiryPriority, InquiryCategory, UserRole, CreateResponseDto } from '../../../types';

// Mock inquiry data
const mockInquiry: Inquiry = {
  id: '1',
  subject: 'Unable to access account',
  description: 'I cannot log into my account after changing my password. The system keeps saying my credentials are incorrect, but I am sure I am entering the right password. I tried resetting it twice but still having the same issue. This is urgent as I need to access my account for an important presentation tomorrow.',
  priority: InquiryPriority.HIGH,
  status: InquiryStatus.IN_PROGRESS,
  category: InquiryCategory.TECHNICAL,
  customerId: 'cust-1',
  customer: {
    id: 'cust-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    company: 'Acme Corp',
    createdAt: '2024-01-15T10:30:00Z'
  },
  assignedTo: {
    id: 'user-1',
    email: 'sarah.wilson@company.com',
    firstName: 'Sarah',
    lastName: 'Wilson',
    fullName: 'Sarah Wilson',
    role: UserRole.CSO
  },
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z'
};

const meta: Meta<typeof ResponseForm> = {
  title: 'CNH/Forms/ResponseForm',
  component: ResponseForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'ResponseForm component allows CSOs to create responses to customer inquiries with draft and submit functionality.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    inquiry: mockInquiry,
    loading: false,
    mode: 'create',
    onSubmit: (values: CreateResponseDto) => {
      console.log('Submit response:', values);
    },
    onSaveDraft: (values: CreateResponseDto) => {
      console.log('Save draft:', values);
    },
    onCancel: () => {
      console.log('Cancel form');
    },
  },
};

export const Loading: Story = {
  args: {
    inquiry: mockInquiry,
    loading: true,
    mode: 'create',
    onSubmit: (values: CreateResponseDto) => {
      console.log('Submit response:', values);
    },
    onSaveDraft: (values: CreateResponseDto) => {
      console.log('Save draft:', values);
    },
    onCancel: () => {
      console.log('Cancel form');
    },
  },
};

export const EditMode: Story = {
  args: {
    inquiry: mockInquiry,
    loading: false,
    mode: 'edit',
    initialValues: {
      responseText: 'Thank you for contacting us regarding your account access issue. I understand how frustrating this must be, especially with your important presentation tomorrow.\n\nI have reset your account credentials and sent you a new temporary password via email. Please check your inbox (including spam folder) and try logging in with the new password.',
      inquiryId: mockInquiry.id,
    },
    onSubmit: (values: CreateResponseDto) => {
      console.log('Update response:', values);
    },
    onSaveDraft: (values: CreateResponseDto) => {
      console.log('Save draft:', values);
    },
    onCancel: () => {
      console.log('Cancel form');
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Edit mode showing a response with pre-filled content for modification.',
      },
    },
  },
};

export const WithoutInquiry: Story = {
  args: {
    loading: false,
    mode: 'create',
    onSubmit: (values: CreateResponseDto) => {
      console.log('Submit response:', values);
    },
    onSaveDraft: (values: CreateResponseDto) => {
      console.log('Save draft:', values);
    },
    onCancel: () => {
      console.log('Cancel form');
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Form without inquiry context, useful for standalone response creation.',
      },
    },
  },
};

export const BillingInquiry: Story = {
  args: {
    inquiry: {
      ...mockInquiry,
      id: '2',
      subject: 'Billing inquiry about recent charges',
      description: 'I have questions about the charges on my latest invoice. Some items seem incorrect and I would like clarification on what each charge represents.',
      priority: InquiryPriority.MEDIUM,
      category: InquiryCategory.BILLING,
    },
    loading: false,
    mode: 'create',
    onSubmit: (values: CreateResponseDto) => {
      console.log('Submit response:', values);
    },
    onSaveDraft: (values: CreateResponseDto) => {
      console.log('Save draft:', values);
    },
    onCancel: () => {
      console.log('Cancel form');
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Response form for a billing-related inquiry showing different context.',
      },
    },
  },
};