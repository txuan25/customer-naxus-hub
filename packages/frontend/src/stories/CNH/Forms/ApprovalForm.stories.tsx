import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ApprovalForm } from '../../../components/Response/ApprovalForm';
import { Response, Inquiry, Customer, ResponseStatus, InquiryStatus, InquiryPriority, InquiryCategory, UserRole } from '../../../types';

const meta: Meta<typeof ApprovalForm> = {
  title: 'CNH/Forms/ApprovalForm',
  component: ApprovalForm,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Manager approval form for reviewing and approving/rejecting CSO responses to customer inquiries (UC-012).',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    onApprove: fn(),
    onReject: fn(),
    onCancel: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data
const mockCustomer: Customer = {
  id: 'customer-1',
  firstName: 'Alice',
  lastName: 'Johnson',
  email: 'alice.johnson@techcorp.com',
  phone: '+1-555-0123',
  company: 'TechCorp Solutions',
  address: '123 Tech Street',
  city: 'San Francisco',
  country: 'USA',
  postalCode: '94105',
  createdAt: '2024-01-15T09:00:00Z',
};

const mockInquiry: Inquiry = {
  id: 'inquiry-1',
  subject: 'API Integration Issues',
  description: 'We are experiencing difficulties integrating with your REST API. The authentication seems to be failing intermittently, and we are getting 401 errors even with valid tokens. This is affecting our production environment and needs urgent attention.',
  priority: InquiryPriority.HIGH,
  status: InquiryStatus.IN_PROGRESS,
  category: InquiryCategory.TECHNICAL,
  customerId: 'customer-1',
  customer: mockCustomer,
  createdAt: '2024-01-20T14:30:00Z',
  updatedAt: '2024-01-20T14:30:00Z',
};

const mockCSO = {
  id: 'cso-1',
  email: 'john.cso@cnh.com',
  firstName: 'John',
  lastName: 'Smith',
  fullName: 'John Smith',
  role: UserRole.CSO,
};

const mockResponse: Response = {
  id: 'response-1',
  responseText: 'Thank you for reaching out about the API integration issues. I understand this is affecting your production environment, so let me address this urgently.\n\nThe 401 errors you\'re experiencing are likely due to token expiration. Our API tokens have a 1-hour expiration by default. Please ensure your application is implementing proper token refresh logic.\n\nHere are the steps to resolve this:\n\n1. Check your token refresh implementation\n2. Verify you\'re using the latest API version (v2.1)\n3. Ensure proper error handling for token expiration\n\nI\'ve also escalated this to our technical team for further investigation. They will reach out within 2 hours with additional troubleshooting steps.\n\nPlease let me know if you need immediate assistance or have any other questions.',
  status: ResponseStatus.PENDING_APPROVAL,
  inquiryId: 'inquiry-1',
  inquiry: mockInquiry,
  responder: mockCSO,
  responderId: mockCSO.id,
  createdAt: '2024-01-20T16:45:00Z',
  updatedAt: '2024-01-20T16:45:00Z',
};

// Stories
export const PendingApproval: Story = {
  args: {
    response: mockResponse,
    inquiry: mockInquiry,
    customer: mockCustomer,
    loading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Manager reviewing a pending response from CSO for approval.',
      },
    },
  },
};

export const LoadingState: Story = {
  args: {
    response: mockResponse,
    inquiry: mockInquiry,
    customer: mockCustomer,
    loading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Form in loading state during approval submission.',
      },
    },
  },
};

export const HighPriorityInquiry: Story = {
  args: {
    response: {
      ...mockResponse,
      responseText: 'URGENT: I understand this is a critical production issue affecting your payment processing system. I am escalating this immediately to our senior technical team.\n\nImmediate actions taken:\n1. Created P1 ticket in our system\n2. Notified on-call engineer\n3. Scheduled emergency call within 30 minutes\n\nOur team lead will contact you directly at the phone number on file. In the meantime, please try the following workaround:\n\n- Switch to backup endpoint: api-backup.company.com\n- Use API key rotation if available\n\nWe will provide updates every 30 minutes until resolved.',
      
    },
    inquiry: {
      ...mockInquiry,
      subject: 'URGENT: Payment Processing API Down',
      description: 'Our entire payment processing system is down due to API failures. This is a P1 incident affecting all our customers. We need immediate assistance as we are losing revenue every minute this is down.',
      priority: InquiryPriority.URGENT,
    },
    customer: mockCustomer,
    loading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'High-priority urgent inquiry requiring immediate approval.',
      },
    },
  },
};

export const SimpleInquiry: Story = {
  args: {
    response: {
      ...mockResponse,
      responseText: 'Thank you for your question about our pricing plans.\n\nOur Enterprise plan includes:\n- Unlimited API calls\n- 24/7 support\n- Custom integrations\n- Dedicated account manager\n\nThe cost is $299/month with annual billing. I can schedule a call with our sales team to discuss your specific needs and potential discounts for volume usage.\n\nWould you prefer a call this week?',
      
    },
    inquiry: {
      ...mockInquiry,
      subject: 'Pricing Information Request',
      description: 'Hello, we are interested in your Enterprise plan. Could you provide detailed pricing information and what features are included? We are currently evaluating different solutions for our growing business.',
      priority: InquiryPriority.MEDIUM,
      category: InquiryCategory.GENERAL,
    },
    customer: mockCustomer,
    loading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Simple inquiry with straightforward response to approve.',
      },
    },
  },
};

export const WithoutCustomerContext: Story = {
  args: {
    response: mockResponse,
    inquiry: mockInquiry,
    // No customer provided
    loading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Approval form when customer context is not available.',
      },
    },
  },
};

export const WithoutInquiryContext: Story = {
  args: {
    response: {
      ...mockResponse,
      inquiry: undefined,
    },
    customer: mockCustomer,
    // No inquiry provided
    loading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Approval form when inquiry context is not available.',
      },
    },
  },
};

export const MinimalContext: Story = {
  args: {
    response: mockResponse,
    // No inquiry or customer context
    loading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Approval form with minimal context information.',
      },
    },
  },
};