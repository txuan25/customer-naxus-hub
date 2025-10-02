import type { Meta, StoryObj } from '@storybook/react-vite';
import { ResponseTable } from '../../../components/Response/ResponseTable';
import { Response, ResponseStatus, UserRole, InquiryStatus, InquiryPriority, InquiryCategory } from '../../../types';

// Mock response data
const mockResponses: Response[] = [
  {
    id: '1',
    message: 'Thank you for contacting us regarding your account access issue. I have reset your account credentials and sent you a new temporary password via email. Please check your inbox and try logging in with the new password.',
    internalNotes: 'Customer called twice about this issue. Account was locked due to multiple failed login attempts.',
    status: ResponseStatus.PENDING_APPROVAL,
    inquiryId: 'inq-1',
    inquiry: {
      id: 'inq-1',
      subject: 'Unable to access account',
      description: 'Cannot log into account after password change',
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
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    createdBy: {
      id: 'user-1',
      email: 'sarah.wilson@company.com',
      firstName: 'Sarah',
      lastName: 'Wilson',
      fullName: 'Sarah Wilson',
      role: UserRole.CSO
    },
    createdAt: '2024-01-15T14:30:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    message: 'I have reviewed your billing inquiry and can confirm that the charges are correct. The additional fees are for premium support services that were activated last month.',
    status: ResponseStatus.APPROVED,
    inquiryId: 'inq-2',
    inquiry: {
      id: 'inq-2',
      subject: 'Billing inquiry about recent charges',
      description: 'Questions about charges on latest invoice',
      priority: InquiryPriority.MEDIUM,
      status: InquiryStatus.APPROVED,
      category: InquiryCategory.BILLING,
      customerId: 'cust-2',
      customer: {
        id: 'cust-2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-0124',
        company: 'Tech Solutions Inc',
        createdAt: '2024-01-10T08:15:00Z'
      },
      createdAt: '2024-01-10T08:15:00Z',
      updatedAt: '2024-01-15T09:20:00Z'
    },
    createdBy: {
      id: 'user-2',
      email: 'mike.chen@company.com',
      firstName: 'Mike',
      lastName: 'Chen',
      fullName: 'Mike Chen',
      role: UserRole.CSO
    },
    approvedBy: {
      id: 'user-3',
      email: 'lisa.manager@company.com',
      firstName: 'Lisa',
      lastName: 'Manager',
      fullName: 'Lisa Manager',
      role: UserRole.MANAGER
    },
    approvalNotes: 'Response approved - accurate and professional',
    createdAt: '2024-01-14T11:45:00Z',
    updatedAt: '2024-01-15T09:20:00Z',
    sentAt: '2024-01-15T09:25:00Z'
  },
  {
    id: '3',
    message: 'We are working on implementing the feature you requested. I will keep you updated on our progress.',
    status: ResponseStatus.DRAFT,
    inquiryId: 'inq-3',
    inquiry: {
      id: 'inq-3',
      subject: 'Feature request for mobile app',
      description: 'Request to add dark mode to mobile application',
      priority: InquiryPriority.LOW,
      status: InquiryStatus.OPEN,
      category: InquiryCategory.FEATURE_REQUEST,
      customerId: 'cust-3',
      customer: {
        id: 'cust-3',
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@example.com',
        createdAt: '2024-01-12T16:20:00Z'
      },
      createdAt: '2024-01-12T16:20:00Z',
      updatedAt: '2024-01-16T10:15:00Z'
    },
    createdBy: {
      id: 'user-1',
      email: 'sarah.wilson@company.com',
      firstName: 'Sarah',
      lastName: 'Wilson',
      fullName: 'Sarah Wilson',
      role: UserRole.CSO
    },
    createdAt: '2024-01-16T10:15:00Z',
    updatedAt: '2024-01-16T10:15:00Z'
  },
  {
    id: '4',
    message: 'Your technical issue has been escalated to our development team. We will provide an update within 24 hours.',
    internalNotes: 'Critical bug affecting multiple customers. Escalated to dev team immediately.',
    status: ResponseStatus.REJECTED,
    inquiryId: 'inq-4',
    inquiry: {
      id: 'inq-4',
      subject: 'Critical system error',
      description: 'Application crashes when trying to save data',
      priority: InquiryPriority.URGENT,
      status: InquiryStatus.REJECTED,
      category: InquiryCategory.TECHNICAL,
      customerId: 'cust-4',
      customer: {
        id: 'cust-4',
        firstName: 'Alice',
        lastName: 'Brown',
        email: 'alice.brown@example.com',
        phone: '+1-555-0126',
        company: 'Enterprise Corp',
        createdAt: '2024-01-16T14:30:00Z'
      },
      createdAt: '2024-01-16T14:30:00Z',
      updatedAt: '2024-01-16T15:45:00Z'
    },
    createdBy: {
      id: 'user-2',
      email: 'mike.chen@company.com',
      firstName: 'Mike',
      lastName: 'Chen',
      fullName: 'Mike Chen',
      role: UserRole.CSO
    },
    rejectedBy: {
      id: 'user-3',
      email: 'lisa.manager@company.com',
      firstName: 'Lisa',
      lastName: 'Manager',
      fullName: 'Lisa Manager',
      role: UserRole.MANAGER
    },
    approvalNotes: 'Response needs more technical details and specific timeline',
    createdAt: '2024-01-16T15:30:00Z',
    updatedAt: '2024-01-16T15:45:00Z'
  },
  {
    id: '5',
    message: 'Thank you for reaching out. Your complaint has been forwarded to our quality assurance team for review.',
    status: ResponseStatus.SENT,
    inquiryId: 'inq-5',
    inquiry: {
      id: 'inq-5',
      subject: 'Service quality complaint',
      description: 'Unsatisfied with recent service experience',
      priority: InquiryPriority.HIGH,
      status: InquiryStatus.CLOSED,
      category: InquiryCategory.COMPLAINT,
      customerId: 'cust-5',
      customer: {
        id: 'cust-5',
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@example.com',
        phone: '+1-555-0127',
        createdAt: '2024-01-14T09:00:00Z'
      },
      createdAt: '2024-01-14T09:00:00Z',
      updatedAt: '2024-01-15T16:30:00Z'
    },
    createdBy: {
      id: 'user-1',
      email: 'sarah.wilson@company.com',
      firstName: 'Sarah',
      lastName: 'Wilson',
      fullName: 'Sarah Wilson',
      role: UserRole.CSO
    },
    approvedBy: {
      id: 'user-3',
      email: 'lisa.manager@company.com',
      firstName: 'Lisa',
      lastName: 'Manager',
      fullName: 'Lisa Manager',
      role: UserRole.MANAGER
    },
    createdAt: '2024-01-15T13:20:00Z',
    updatedAt: '2024-01-15T16:30:00Z',
    sentAt: '2024-01-15T16:35:00Z'
  }
];

const meta: Meta<typeof ResponseTable> = {
  title: 'CNH/Tables/ResponseTable',
  component: ResponseTable,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'ResponseTable component displays a list of customer service responses with various statuses and management actions.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    responses: mockResponses,
    loading: false,
    pagination: {
      current: 1,
      pageSize: 10,
      total: 25,
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '50'],
      onChange: (page: number, pageSize: number) => {
        console.log('Pagination changed:', { page, pageSize });
      },
    },
    onSearch: (value: string) => {
      console.log('Search:', value);
    },
    onApprove: (id: string, notes?: string) => {
      console.log('Approve response:', { id, notes });
    },
    onReject: (id: string, notes?: string) => {
      console.log('Reject response:', { id, notes });
    },
  },
};

export const Loading: Story = {
  args: {
    responses: [],
    loading: true,
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    onSearch: (value: string) => {
      console.log('Search:', value);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading state of the ResponseTable component.',
      },
    },
  },
};

export const EmptyState: Story = {
  args: {
    responses: [],
    loading: false,
    onSearch: (value: string) => {
      console.log('Search:', value);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state when no responses are available.',
      },
    },
  },
};

export const PendingApprovalOnly: Story = {
  args: {
    responses: mockResponses.filter(response => response.status === ResponseStatus.PENDING_APPROVAL),
    loading: false,
    pagination: {
      current: 1,
      pageSize: 10,
      total: 1,
    },
    onSearch: (value: string) => {
      console.log('Search:', value);
    },
    onApprove: (id: string, notes?: string) => {
      console.log('Approve response:', { id, notes });
    },
    onReject: (id: string, notes?: string) => {
      console.log('Reject response:', { id, notes });
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Table showing only responses pending approval, useful for managers.',
      },
    },
  },
};

export const DraftResponses: Story = {
  args: {
    responses: mockResponses.filter(response => response.status === ResponseStatus.DRAFT),
    loading: false,
    pagination: {
      current: 1,
      pageSize: 10,
      total: 1,
    },
    onSearch: (value: string) => {
      console.log('Search:', value);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Table showing draft responses that CSOs can edit.',
      },
    },
  },
};

export const WithoutPagination: Story = {
  args: {
    responses: mockResponses.slice(0, 3),
    loading: false,
    onSearch: (value: string) => {
      console.log('Search:', value);
    },
    onApprove: (id: string, notes?: string) => {
      console.log('Approve response:', { id, notes });
    },
    onReject: (id: string, notes?: string) => {
      console.log('Reject response:', { id, notes });
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Table without pagination for smaller datasets.',
      },
    },
  },
};

export const HighPriorityResponses: Story = {
  args: {
    responses: mockResponses.filter(response => 
      response.inquiry?.priority === InquiryPriority.HIGH || 
      response.inquiry?.priority === InquiryPriority.URGENT
    ),
    loading: false,
    pagination: {
      current: 1,
      pageSize: 10,
      total: 3,
    },
    onSearch: (value: string) => {
      console.log('Search:', value);
    },
    onApprove: (id: string, notes?: string) => {
      console.log('Approve response:', { id, notes });
    },
    onReject: (id: string, notes?: string) => {
      console.log('Reject response:', { id, notes });
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Table filtered to show only high-priority and urgent responses.',
      },
    },
  },
};