import type { Meta, StoryObj } from '@storybook/react-vite';

import { fn } from 'storybook/test';

import { StatusBadge } from '../../../components/Status/Badge/StatusBadge';

const meta = {
  title: 'CNH/CoreComponents/StatusBadge',
  component: StatusBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: { control: 'select', options: ['active', 'inactive', 'pending', 'approved', 'rejected'] },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {
    children: 'Active',
    status: 'active',
  },
};

export const Inactive: Story = {
  args: {
    children: 'Inactive',
    status: 'inactive',
  },
};

export const Pending: Story = {
  args: {
    children: 'Pending',
    status: 'pending',
  },
};

export const Approved: Story = {
  args: {
    children: 'Approved',
    status: 'approved',
  },
};

export const Rejected: Story = {
  args: {
    children: 'Rejected',
    status: 'rejected',
  },
};