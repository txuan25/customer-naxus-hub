import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataTable } from '../../../components/DataTable/DataTable';
import { Button, Space } from 'antd';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';

// Mock data for demonstration
const mockData = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    status: 'inactive',
    createdAt: '2024-01-20T14:45:00Z',
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    status: 'pending',
    createdAt: '2024-01-10T09:15:00Z',
  },
];

const basicColumns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    sorter: (a: any, b: any) => a.email.localeCompare(b.email),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    filters: [
      { text: 'Active', value: 'active' },
      { text: 'Inactive', value: 'inactive' },
      { text: 'Pending', value: 'pending' },
    ],
    onFilter: (value: any, record: any) => record.status === value,
  },
  {
    title: 'Created',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (date: string) => new Date(date).toLocaleDateString(),
    sorter: (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_: any, record: any) => (
      <Space size="small">
        <Button type="text" icon={<EyeOutlined />} size="small" />
        <Button type="text" icon={<EditOutlined />} size="small" />
      </Space>
    ),
  },
];

const meta: Meta<typeof DataTable> = {
  title: 'CNH/CoreComponents/DataTable',
  component: DataTable,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'DataTable is the base table component that provides consistent pagination, search, filtering, and table functionality across the application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    searchable: {
      control: 'boolean',
      description: 'Enable search functionality',
    },
    filterable: {
      control: 'boolean',
      description: 'Enable filter functionality',
    },
    loading: {
      control: 'boolean',
      description: 'Loading state of the table',
    },
    searchPlaceholder: {
      control: 'text',
      description: 'Search input placeholder text',
    },
    filterPlaceholder: {
      control: 'text',
      description: 'Filter dropdown placeholder text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    columns: basicColumns,
    data: mockData,
    loading: false,
    searchable: true,
    filterable: false,
    pagination: {
      current: 1,
      pageSize: 10,
      total: mockData.length,
      showSizeChanger: true,
      pageSizeOptions: ['5', '10', '20'],
    },
  },
};

export const WithSearch: Story = {
  args: {
    ...Default.args,
    searchable: true,
    searchPlaceholder: 'Search users...',
    onSearch: (value: string) => console.log('Search:', value),
  },
  parameters: {
    docs: {
      description: {
        story: 'DataTable with search functionality enabled.',
      },
    },
  },
};

export const WithFilter: Story = {
  args: {
    ...Default.args,
    filterable: true,
    filterOptions: [
      { text: 'Active', value: 'active' },
      { text: 'Inactive', value: 'inactive' },
      { text: 'Pending', value: 'pending' },
    ],
    filterPlaceholder: 'Filter by status',
    onFilter: (filters: any) => console.log('Filter:', filters),
  },
  parameters: {
    docs: {
      description: {
        story: 'DataTable with custom filter options.',
      },
    },
  },
};

export const WithSearchAndFilter: Story = {
  args: {
    ...Default.args,
    searchable: true,
    filterable: true,
    searchPlaceholder: 'Search users...',
    filterOptions: [
      { text: 'Active', value: 'active' },
      { text: 'Inactive', value: 'inactive' },
      { text: 'Pending', value: 'pending' },
    ],
    filterPlaceholder: 'Filter by status',
    onSearch: (value: string) => console.log('Search:', value),
    onFilter: (filters: any) => console.log('Filter:', filters),
  },
  parameters: {
    docs: {
      description: {
        story: 'DataTable with both search and filter functionality.',
      },
    },
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    loading: true,
    data: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'DataTable in loading state.',
      },
    },
  },
};

export const Empty: Story = {
  args: {
    ...Default.args,
    data: [],
    emptyText: 'No data available',
  },
  parameters: {
    docs: {
      description: {
        story: 'DataTable with empty data and custom empty text.',
      },
    },
  },
};

export const NoPagination: Story = {
  args: {
    ...Default.args,
    pagination: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: 'DataTable without pagination.',
      },
    },
  },
};

export const CustomPagination: Story = {
  args: {
    ...Default.args,
    pagination: {
      current: 2,
      pageSize: 2,
      total: 10,
      showSizeChanger: false,
      pageSizeOptions: ['2', '5', '10'],
      onChange: (page: number, pageSize: number) => 
        console.log('Pagination changed:', { page, pageSize }),
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'DataTable with custom pagination settings.',
      },
    },
  },
};

export const NoControls: Story = {
  args: {
    ...Default.args,
    showControls: false,
    searchable: true,
    filterable: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'DataTable with search and filter controls hidden.',
      },
    },
  },
};