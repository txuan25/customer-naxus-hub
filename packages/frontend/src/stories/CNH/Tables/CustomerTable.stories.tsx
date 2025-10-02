import type { Meta, StoryObj } from '@storybook/react-vite';
import { CustomerTable } from '../../../components/Customer/CustomerTable';
import { Customer, User, UserRole } from '../../../types';

// Mock data for customers
const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'john.cso@cnh.com',
    firstName: 'John',
    lastName: 'Smith',
    fullName: 'John Smith',
    role: UserRole.CSO,
  },
  {
    id: 'user-2',
    email: 'jane.manager@cnh.com',
    firstName: 'Jane',
    lastName: 'Doe',
    fullName: 'Jane Doe',
    role: UserRole.MANAGER,
  },
];

const mockCustomers: Customer[] = [
  {
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
    notes: 'Important client with high priority requirements',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
    assignedTo: mockUsers[0],
    createdBy: mockUsers[1],
  },
  {
    id: 'customer-2',
    firstName: 'Bob',
    lastName: 'Wilson',
    email: 'bob.wilson@startupinc.com',
    phone: '+1-555-0456',
    company: 'Startup Inc',
    address: '456 Innovation Blvd',
    city: 'Austin',
    country: 'USA',
    postalCode: '73301',
    notes: 'Fast-growing startup, potential for expansion',
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-18T16:20:00Z',
    assignedTo: mockUsers[0],
    createdBy: mockUsers[1],
  },
  {
    id: 'customer-3',
    firstName: 'Carol',
    lastName: 'Brown',
    email: 'carol.brown@enterprise.co',
    phone: '+1-555-0789',
    company: 'Enterprise Co',
    address: '789 Business Park',
    city: 'New York',
    country: 'USA',
    postalCode: '10001',
    notes: 'Large enterprise client with complex requirements',
    createdAt: '2024-01-05T11:45:00Z',
    updatedAt: '2024-01-22T13:10:00Z',
    assignedTo: mockUsers[1],
    createdBy: mockUsers[1],
  },
  {
    id: 'customer-4',
    firstName: 'David',
    lastName: 'Miller',
    email: 'david.miller@freelance.net',
    phone: '+1-555-0321',
    company: 'Freelance Designer',
    address: '321 Creative Lane',
    city: 'Portland',
    country: 'USA',
    postalCode: '97201',
    notes: 'Individual freelancer, requires flexible support',
    createdAt: '2024-01-12T14:20:00Z',
    updatedAt: '2024-01-19T10:55:00Z',
    createdBy: mockUsers[0],
  },
  {
    id: 'customer-5',
    firstName: 'Emma',
    lastName: 'Davis',
    email: 'emma.davis@consulting.org',
    phone: '+1-555-0654',
    company: 'Davis Consulting',
    address: '654 Advisory Street',
    city: 'Chicago',
    country: 'USA',
    postalCode: '60601',
    notes: 'Management consulting firm, frequent communication needed',
    createdAt: '2024-01-08T08:30:00Z',
    updatedAt: '2024-01-25T15:40:00Z',
    assignedTo: mockUsers[0],
    createdBy: mockUsers[1],
  },
];

const meta: Meta<typeof CustomerTable> = {
  title: 'CNH/Tables/CustomerTable',
  component: CustomerTable,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Customer table with role-based filtering and pagination. Supports CSO and Manager views with different permission levels.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story with all customers
export const Default: Story = {
  args: {
    customers: mockCustomers,
    loading: false,
    pagination: {
      current: 1,
      pageSize: 25,
      total: mockCustomers.length,
      showSizeChanger: true,
      pageSizeOptions: ['10', '25', '50', '100'],
    },
  },
};

// Loading state
export const Loading: Story = {
  args: {
    customers: [],
    loading: true,
    pagination: {
      current: 1,
      pageSize: 25,
      total: 0,
    },
  },
};

// Empty state
export const Empty: Story = {
  args: {
    customers: [],
    loading: false,
    pagination: {
      current: 1,
      pageSize: 25,
      total: 0,
    },
  },
};

// Single customer
export const SingleCustomer: Story = {
  args: {
    customers: [mockCustomers[0]],
    loading: false,
    pagination: {
      current: 1,
      pageSize: 25,
      total: 1,
    },
  },
};

// CSO View (limited customers)
export const CSOView: Story = {
  args: {
    customers: mockCustomers.filter(customer => customer.assignedTo?.id === 'user-1'),
    loading: false,
    pagination: {
      current: 1,
      pageSize: 25,
      total: 3,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'CSO view showing only customers assigned to them. CSOs can only edit customers assigned to them.',
      },
    },
  },
};

// Manager View (all customers)
export const ManagerView: Story = {
  args: {
    customers: mockCustomers,
    loading: false,
    pagination: {
      current: 1,
      pageSize: 25,
      total: mockCustomers.length,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Manager view showing all customers. Managers can edit and delete any customer.',
      },
    },
  },
};

// With pagination
export const WithPagination: Story = {
  args: {
    customers: mockCustomers,
    loading: false,
    pagination: {
      current: 2,
      pageSize: 2,
      total: 10,
      showSizeChanger: true,
      pageSizeOptions: ['2', '5', '10', '25'],
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Customer table with pagination controls showing page 2 of 5 pages.',
      },
    },
  },
};

// Mixed assignment status
export const MixedAssignment: Story = {
  args: {
    customers: [
      mockCustomers[0], // assigned
      mockCustomers[3], // unassigned
      mockCustomers[1], // assigned
    ],
    loading: false,
    pagination: {
      current: 1,
      pageSize: 25,
      total: 3,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Table showing mix of assigned and unassigned customers for Manager view.',
      },
    },
  },
};