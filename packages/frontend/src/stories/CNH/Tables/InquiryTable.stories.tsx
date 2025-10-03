import type { Meta, StoryObj } from '@storybook/react-vite';
import { InquiryTable } from '../../../components/Inquiry/InquiryTable';
import { Inquiry, InquiryStatus, InquiryPriority, InquiryCategory, UserRole } from '../../../types';

// Mock data
const mockInquiries: Inquiry[] = [
  {
    id: '1',
    subject: 'Unable to access account',
    message: 'I cannot log into my account after changing my password. Please help.',
    priority: InquiryPriority.HIGH,
    status: InquiryStatus.PENDING,
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
    assignedTo: 'user-1',
    assignee: {
      id: 'user-1',
      email: 'sarah.wilson@company.com',
      firstName: 'Sarah',
      lastName: 'Wilson',
      fullName: 'Sarah Wilson',
      role: UserRole.CSO
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    subject: 'Billing inquiry about recent charges',
    message: 'I have questions about the charges on my latest invoice. Some items seem incorrect.',
    priority: InquiryPriority.MEDIUM,
    status: InquiryStatus.IN_PROGRESS,
    category: InquiryCategory.BILLING,
    customerId: 'cust-2',
    customer: {
      id: 'cust-2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-0456',
      company: 'Tech Solutions',
      createdAt: '2024-01-14T14:20:00Z'
    },
    assignedTo: 'user-2',
    assignee: {
      id: 'user-2',
      email: 'mike.johnson@company.com',
      firstName: 'Mike',
      lastName: 'Johnson',
      fullName: 'Mike Johnson',
      role: UserRole.CSO
    },
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-15T09:15:00Z'
  },
  {
    id: '3',
    subject: 'Feature request for mobile app',
    message: 'Would it be possible to add dark mode to the mobile application?',
    priority: InquiryPriority.LOW,
    status: InquiryStatus.PENDING,
    category: InquiryCategory.FEATURE_REQUEST,
    customerId: 'cust-3',
    customer: {
      id: 'cust-3',
      firstName: 'Robert',
      lastName: 'Brown',
      email: 'robert.brown@example.com',
      company: 'Design Studio',
      createdAt: '2024-01-13T16:45:00Z'
    },
    createdAt: '2024-01-13T16:45:00Z',
    updatedAt: '2024-01-14T11:30:00Z'
  },
  {
    id: '4',
    subject: 'Service complaint - slow response times',
    message: 'The system has been very slow for the past week. This is affecting our business operations.',
    priority: InquiryPriority.URGENT,
    status: InquiryStatus.CLOSED,
    category: InquiryCategory.COMPLAINT,
    customerId: 'cust-4',
    customer: {
      id: 'cust-4',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@example.com',
      phone: '+1-555-0789',
      company: 'Enterprise LLC',
      createdAt: '2024-01-12T09:00:00Z'
    },
    assignedTo: 'user-1',
    assignee: {
      id: 'user-1',
      email: 'sarah.wilson@company.com',
      firstName: 'Sarah',
      lastName: 'Wilson',
      fullName: 'Sarah Wilson',
      role: UserRole.CSO
    },
    createdAt: '2024-01-12T09:00:00Z',
    updatedAt: '2024-01-15T16:20:00Z'
  }
];

const meta: Meta<typeof InquiryTable> = {
  title: 'CNH/Tables/InquiryTable',
  component: InquiryTable,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'InquiryTable component displays customer inquiries with filtering, sorting, and action capabilities based on user roles.'
      }
    }
  },
  args: {
    inquiries: mockInquiries,
    loading: false,
  },
  argTypes: {
    inquiries: {
      description: 'Array of inquiry objects to display',
      control: { type: 'object' }
    },
    loading: {
      description: 'Loading state of the table',
      control: { type: 'boolean' }
    },
    pagination: {
      description: 'Pagination configuration',
      control: { type: 'object' }
    },
    onSearch: {
      description: 'Search handler function',
      action: 'searched'
    }
  }
};

export default meta;
type Story = StoryObj<typeof InquiryTable>;

export const Default: Story = {
  args: {
    inquiries: mockInquiries,
    loading: false,
    pagination: {
      current: 1,
      pageSize: 25,
      total: mockInquiries.length,
      showSizeChanger: true,
      pageSizeOptions: ['10', '25', '50', '100'],
    },
  },
};

export const Loading: Story = {
  args: {
    inquiries: [],
    loading: true,
    pagination: {
      current: 1,
      pageSize: 25,
      total: 0,
    },
  },
};

export const Empty: Story = {
  args: {
    inquiries: [],
    loading: false,
    pagination: {
      current: 1,
      pageSize: 25,
      total: 0,
    },
  },
};

export const WithPagination: Story = {
  args: {
    inquiries: mockInquiries,
    loading: false,
    pagination: {
      current: 2,
      pageSize: 2,
      total: 10,
      showSizeChanger: true,
      pageSizeOptions: ['2', '5', '10', '25'],
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Inquiry table with pagination controls showing page 2 of 5 pages.',
      },
    },
  },
};

export const HighPriorityOnly: Story = {
  args: {
    inquiries: mockInquiries.filter(inquiry =>
      inquiry.priority === InquiryPriority.HIGH || inquiry.priority === InquiryPriority.URGENT
    ),
    loading: false,
    pagination: {
      current: 1,
      pageSize: 25,
      total: 2,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Table showing only high and urgent priority inquiries.',
      },
    },
  },
};

export const OpenInquiries: Story = {
  args: {
    inquiries: mockInquiries.filter(inquiry =>
      inquiry.status === InquiryStatus.PENDING || inquiry.status === InquiryStatus.IN_PROGRESS
    ),
    loading: false,
    pagination: {
      current: 1,
      pageSize: 25,
      total: 2,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Table showing only open and in-progress inquiries for CSO action.',
      },
    },
  },
};