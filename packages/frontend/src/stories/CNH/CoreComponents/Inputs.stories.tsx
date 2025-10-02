import type { Meta, StoryObj } from '@storybook/react-vite';

import { fn } from 'storybook/test';

import { InputText } from '../../../components/Input/Text/InputText';

const meta = {
  title: 'CNH/CoreComponents/Inputs',
  component: InputText,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['small', 'middle', 'large'] },
  },
  args: { onChange: fn() },
} satisfies Meta<typeof InputText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: {
    label: 'Text Input',
    placeholder: 'Enter text...',
  },
};

export const TextWithError: Story = {
  args: {
    label: 'Text Input',
    placeholder: 'Enter text...',
    error: 'This field is required',
  },
};

export const TextRequired: Story = {
  args: {
    label: 'Required Field',
    placeholder: 'Enter text...',
    required: true,
  },
};

export const TextDisabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'Cannot edit',
    disabled: true,
  },
};

export const Email: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter email...',
    type: 'email',
  },
};

export const Password: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter password...',
    type: 'password',
  },
};