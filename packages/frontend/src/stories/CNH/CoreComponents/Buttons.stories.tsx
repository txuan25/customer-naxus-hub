import type { Meta, StoryObj } from '@storybook/react-vite';

import { fn } from 'storybook/test';

import { ButtonPrimary } from '../../../components/Button/Primary/ButtonPrimary';
import { ButtonSecondary } from '../../../components/Button/Secondary/ButtonSecondary';
import { ButtonSubmit } from '../../../components/Button/Submit/ButtonSubmit';
import { ButtonCancel } from '../../../components/Button/Cancel/ButtonCancel';

const meta = {
  title: 'CNH/CoreComponents/Buttons',
  component: ButtonPrimary,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['small', 'middle', 'large'] },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof ButtonPrimary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
  },
};

export const Submit: Story = {
  args: {
    children: 'Submit Form',
  },
};

export const Cancel: Story = {
  args: {
    children: 'Cancel',
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading...',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'small',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'large',
  },
};