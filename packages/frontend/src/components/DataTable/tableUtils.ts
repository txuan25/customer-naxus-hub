import { User, UserRole } from '../../types';

// Common formatting utilities
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getFullName = (firstName?: string, lastName?: string): string => {
  if (!firstName && !lastName) return 'Unknown';
  return `${firstName || ''} ${lastName || ''}`.trim();
};

export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Common permission utilities
export const createPermissionChecker = (identity?: User) => ({
  canEdit: (assignedTo?: User, createdBy?: User) => {
    if (!identity) return false;
    if (identity.role === UserRole.MANAGER) return true;
    if (identity.role === UserRole.CSO) {
      return assignedTo?.id === identity.id || createdBy?.id === identity.id;
    }
    return false;
  },
  
  canDelete: () => {
    return identity?.role === UserRole.MANAGER;
  },
  
  canView: () => true,
  
  isManager: () => identity?.role === UserRole.MANAGER,
  isCSO: () => identity?.role === UserRole.CSO,
});

// Hook-safe wrappers for Storybook compatibility
export const useSafeNavigation = () => {
  try {
    // This would be the real useNavigation hook in actual app
    return {
      show: (resource: string, id: string) => console.log('Navigate to show:', resource, id),
      edit: (resource: string, id: string) => console.log('Navigate to edit:', resource, id),
      create: (resource: string, action?: string, params?: any) => console.log('Navigate to create:', resource, action, params),
    };
  } catch {
    return {
      show: (resource: string, id: string) => console.log('Navigate to show:', resource, id),
      edit: (resource: string, id: string) => console.log('Navigate to edit:', resource, id),
      create: (resource: string, action?: string, params?: any) => console.log('Navigate to create:', resource, action, params),
    };
  }
};

export const useSafeDelete = () => {
  try {
    // This would be the real useDelete hook in actual app
    return { mutate: (params: any) => console.log('Delete:', params) };
  } catch {
    return { mutate: (params: any) => console.log('Delete:', params) };
  }
};

export const useSafeIdentity = () => {
  try {
    // This would be the real useGetIdentity hook in actual app
    return {
      data: {
        id: 'mock-user',
        email: 'mock@example.com',
        firstName: 'Mock',
        lastName: 'User',
        fullName: 'Mock User',
        role: UserRole.MANAGER
      }
    };
  } catch {
    return {
      data: {
        id: 'mock-user',
        email: 'mock@example.com',
        firstName: 'Mock',
        lastName: 'User',
        fullName: 'Mock User',
        role: UserRole.MANAGER
      }
    };
  }
};