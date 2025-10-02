import { DataProvider } from "@refinedev/core";
import { Customer, Inquiry, Response, UserRole, InquiryStatus, ResponseStatus, InquiryPriority, InquiryCategory } from "./types";

// Mock data
const mockCustomers: Customer[] = [
  {
    id: "1",
    firstName: "Alice",
    lastName: "Johnson",
    email: "alice.johnson@techcorp.com",
    phone: "+1-555-0123",
    company: "TechCorp Solutions",
    address: "123 Tech Street",
    city: "San Francisco",
    country: "USA",
    postalCode: "94105",
    createdAt: "2024-01-15T09:00:00Z",
  },
  {
    id: "2", 
    firstName: "Bob",
    lastName: "Smith",
    email: "bob.smith@innovate.com",
    phone: "+1-555-0456",
    company: "Innovate Inc",
    address: "456 Innovation Ave",
    city: "New York",
    country: "USA",
    postalCode: "10001",
    createdAt: "2024-01-16T10:00:00Z",
  },
  {
    id: "3",
    firstName: "Carol",
    lastName: "Davis",
    email: "carol.davis@startup.io",
    phone: "+1-555-0789",
    company: "Startup.io",
    address: "789 Startup Blvd",
    city: "Austin",
    country: "USA", 
    postalCode: "73301",
    createdAt: "2024-01-17T11:00:00Z",
  }
];

const mockInquiries: Inquiry[] = [
  {
    id: "1",
    subject: "API Integration Issues",
    description: "We are experiencing difficulties integrating with your REST API. The authentication seems to be failing intermittently.",
    priority: InquiryPriority.HIGH,
    status: InquiryStatus.IN_PROGRESS,
    category: InquiryCategory.TECHNICAL,
    customerId: "1",
    customer: mockCustomers[0],
    assignedTo: {
      id: "1",
      email: "cso1@cnh.com",
      firstName: "John",
      lastName: "CSO",
      fullName: "John CSO",
      role: UserRole.CSO,
    },
    createdAt: "2024-01-20T14:30:00Z",
    updatedAt: "2024-01-20T16:45:00Z",
  },
  {
    id: "2",
    subject: "Billing Question",
    description: "I have a question about my monthly invoice. There seems to be a discrepancy in the charges.",
    priority: InquiryPriority.MEDIUM,
    status: InquiryStatus.OPEN,
    category: InquiryCategory.BILLING,
    customerId: "2",
    customer: mockCustomers[1],
    assignedTo: {
      id: "1",
      email: "cso1@cnh.com",
      firstName: "John",
      lastName: "CSO",
      fullName: "John CSO",
      role: UserRole.CSO,
    },
    createdAt: "2024-01-21T09:15:00Z",
    updatedAt: "2024-01-21T09:15:00Z",
  },
  {
    id: "3",
    subject: "Feature Request",
    description: "Would it be possible to add export functionality to the dashboard? This would greatly help our reporting needs.",
    priority: InquiryPriority.LOW,
    status: InquiryStatus.OPEN,
    category: InquiryCategory.GENERAL,
    customerId: "3",
    customer: mockCustomers[2],
    assignedTo: undefined, // Unassigned inquiry - CSO won't see reply button for this
    createdAt: "2024-01-22T13:45:00Z",
    updatedAt: "2024-01-22T13:45:00Z",
  }
];

const mockResponses: Response[] = [
  {
    id: "1",
    message: "Thank you for reaching out about the API integration issues. I understand this is affecting your production environment. Let me help you resolve this quickly.\n\nThe 401 errors are likely due to token expiration. Our API tokens have a 1-hour expiration by default. Please ensure your application implements proper token refresh logic.",
    internalNotes: "Customer is on Enterprise plan - high priority. Technical team notified.",
    status: ResponseStatus.SENT,
    inquiryId: "1",
    inquiry: {
      id: "1",
      subject: "API Integration Issues",
      customer: {
        id: "1",
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice.johnson@techcorp.com",
      },
    },
    createdBy: {
      id: "1",
      email: "cso1@cnh.com",
      firstName: "John",
      lastName: "CSO",
      fullName: "John CSO",
      role: UserRole.CSO,
    },
    createdAt: "2024-01-20T16:45:00Z",
    updatedAt: "2024-01-20T16:45:00Z",
  },
  {
    id: "2",
    message: "I understand your concerns about the billing discrepancy. Let me review your account details and provide clarification.\n\nAfter checking your invoice, I can see that the additional charges are for the premium support package you activated last month. This includes 24/7 technical support and priority response times.",
    internalNotes: "Customer upgraded to premium last month but wasn't notified properly. Need to improve onboarding communication.",
    status: ResponseStatus.PENDING_APPROVAL,
    inquiryId: "2",
    inquiry: {
      id: "2",
      subject: "Billing Question",
      customer: {
        id: "2",
        firstName: "Bob",
        lastName: "Smith",
        email: "bob.smith@innovate.com",
      },
    },
    createdBy: {
      id: "1",
      email: "cso1@cnh.com",
      firstName: "John",
      lastName: "CSO",
      fullName: "John CSO",
      role: UserRole.CSO,
    },
    createdAt: "2024-01-21T10:30:00Z",
    updatedAt: "2024-01-21T10:30:00Z",
  },
  {
    id: "3",
    message: "Thank you for your feature request regarding export functionality. This is indeed a valuable suggestion that would benefit many of our users.\n\nI'm pleased to inform you that dashboard export is currently in our development roadmap for Q2 2024. The feature will include CSV, PDF, and Excel export options.",
    internalNotes: "Feature already planned for Q2. Customer should be added to beta testing list.",
    status: ResponseStatus.DRAFT,
    inquiryId: "3",
    inquiry: {
      id: "3",
      subject: "Feature Request",
      customer: {
        id: "3",
        firstName: "Carol",
        lastName: "Davis",
        email: "carol.davis@startup.io",
      },
    },
    createdBy: {
      id: "1",
      email: "cso1@cnh.com",
      firstName: "John",
      lastName: "CSO",
      fullName: "John CSO",
      role: UserRole.CSO,
    },
    createdAt: "2024-01-22T14:15:00Z",
    updatedAt: "2024-01-22T14:15:00Z",
  },
  // Additional responses for inquiry #1 (API Integration Issues) - Multiple responses per inquiry
  {
    id: "4",
    message: "Following up on our previous response about API token expiration. I've also prepared a comprehensive guide for implementing token refresh in your application.\n\nAdditionally, I notice you might benefit from our webhook notifications to handle real-time events instead of frequent polling.",
    internalNotes: "Customer responded positively to initial solution. Providing additional technical guidance.",
    status: ResponseStatus.SENT,
    inquiryId: "1",
    inquiry: {
      id: "1",
      subject: "API Integration Issues",
      customer: {
        id: "1",
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice.johnson@techcorp.com",
      },
    },
    createdBy: {
      id: "2",
      email: "cso2@cnh.com",
      firstName: "Sarah",
      lastName: "CSO",
      fullName: "Sarah CSO",
      role: UserRole.CSO,
    },
    createdAt: "2024-01-21T09:30:00Z",
    updatedAt: "2024-01-21T09:30:00Z",
  },
  {
    id: "5",
    message: "Based on your feedback, I've escalated your case to our senior technical team. They have identified that your specific use case would benefit from our Enterprise API tier which includes extended token lifetime and priority support.\n\nI'm attaching detailed documentation and a proposal for upgrading your API access.",
    internalNotes: "Technical team recommends Enterprise API tier. Need manager approval for pricing discussion.",
    status: ResponseStatus.PENDING_APPROVAL,
    inquiryId: "1",
    inquiry: {
      id: "1",
      subject: "API Integration Issues",
      customer: {
        id: "1",
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice.johnson@techcorp.com",
      },
    },
    createdBy: {
      id: "1",
      email: "cso1@cnh.com",
      firstName: "John",
      lastName: "CSO",
      fullName: "John CSO",
      role: UserRole.CSO,
    },
    createdAt: "2024-01-21T14:20:00Z",
    updatedAt: "2024-01-21T14:20:00Z",
  },
  // Additional responses for inquiry #2 (Billing Question) - Multiple responses per inquiry
  {
    id: "6",
    message: "Here are the detailed billing breakdown and feature comparison for your premium support package:\n\n- Premium Support: $500/month\n- Includes: 24/7 phone support, priority email response (2 hours), dedicated account manager\n- Previous Basic Support: $200/month\n\nI can also offer a detailed invoice explanation call if needed.",
    internalNotes: "Initial response was too brief. Providing detailed breakdown as requested.",
    status: ResponseStatus.REJECTED,
    inquiryId: "2",
    inquiry: {
      id: "2",
      subject: "Billing Question",
      customer: {
        id: "2",
        firstName: "Bob",
        lastName: "Smith",
        email: "bob.smith@innovate.com",
      },
    },
    createdBy: {
      id: "2",
      email: "cso2@cnh.com",
      firstName: "Sarah",
      lastName: "CSO",
      fullName: "Sarah CSO",
      role: UserRole.CSO,
    },
    rejectionReason: "Response needs to include specific refund options and escalation procedures.",
    rejectedBy: {
      id: "3",
      email: "manager1@cnh.com",
      firstName: "Mike",
      lastName: "Manager",
      fullName: "Mike Manager",
      role: UserRole.MANAGER,
    },
    createdAt: "2024-01-21T11:15:00Z",
    updatedAt: "2024-01-21T13:45:00Z",
  },
  {
    id: "7",
    message: "I apologize for any confusion regarding the billing charges. After thorough review with our billing team, I can offer the following resolution options:\n\n1. Partial refund for the first month of premium support\n2. Downgrade back to Basic Support with prorated billing\n3. Continue with Premium Support at a 20% discount for the next 3 months\n\nI'm also scheduling a call with our billing specialist to ensure this doesn't happen again.",
    internalNotes: "Manager approved offering refund options and discount. Customer satisfaction is priority.",
    status: ResponseStatus.APPROVED,
    inquiryId: "2",
    inquiry: {
      id: "2",
      subject: "Billing Question",
      customer: {
        id: "2",
        firstName: "Bob",
        lastName: "Smith",
        email: "bob.smith@innovate.com",
      },
    },
    createdBy: {
      id: "2",
      email: "cso2@cnh.com",
      firstName: "Sarah",
      lastName: "CSO",
      fullName: "Sarah CSO",
      role: UserRole.CSO,
    },
    approvedBy: {
      id: "3",
      email: "manager1@cnh.com",
      firstName: "Mike",
      lastName: "Manager",
      fullName: "Mike Manager",
      role: UserRole.MANAGER,
    },
    createdAt: "2024-01-21T15:45:00Z",
    updatedAt: "2024-01-21T16:30:00Z",
  },
  // Additional responses for inquiry #3 (Feature Request) - Multiple responses per inquiry
  {
    id: "8",
    message: "I have great news about the export functionality! Our development team has accelerated the timeline and the feature is now available in beta.\n\nWould you like to join our beta testing program? You'll get early access to:\n- CSV export for all dashboard data\n- PDF reports with custom branding\n- Scheduled automated exports\n\nI can set up your beta access today.",
    internalNotes: "Development timeline moved up. Customer would be perfect beta tester given their specific needs.",
    status: ResponseStatus.SENT,
    inquiryId: "3",
    inquiry: {
      id: "3",
      subject: "Feature Request",
      customer: {
        id: "3",
        firstName: "Carol",
        lastName: "Davis",
        email: "carol.davis@startup.io",
      },
    },
    createdBy: {
      id: "1",
      email: "cso1@cnh.com",
      firstName: "John",
      lastName: "CSO",
      fullName: "John CSO",
      role: UserRole.CSO,
    },
    createdAt: "2024-01-23T10:00:00Z",
    updatedAt: "2024-01-23T10:00:00Z",
  },
  {
    id: "9",
    message: "Thank you for accepting our beta invitation! I've successfully activated your beta access for the export functionality.\n\nHere's your personalized setup guide and beta access credentials. Our product team would love to schedule a 30-minute feedback session next week to hear your thoughts on the new features.\n\nYour feedback will directly influence the final release version.",
    internalNotes: "Beta access granted. Product team wants feedback session scheduled. This customer's input is valuable for product development.",
    status: ResponseStatus.DRAFT,
    inquiryId: "3",
    inquiry: {
      id: "3",
      subject: "Feature Request",
      customer: {
        id: "3",
        firstName: "Carol",
        lastName: "Davis",
        email: "carol.davis@startup.io",
      },
    },
    createdBy: {
      id: "2",
      email: "cso2@cnh.com",
      firstName: "Sarah",
      lastName: "CSO",
      fullName: "Sarah CSO",
      role: UserRole.CSO,
    },
    createdAt: "2024-01-23T16:45:00Z",
    updatedAt: "2024-01-23T16:45:00Z",
  }
];

// Add responses to inquiries (without circular reference)
mockInquiries[0].responses = [
  {
    id: "1",
    message: "Thank you for reaching out about the API integration issues. I understand this is affecting your production environment. Let me help you resolve this quickly.\n\nThe 401 errors are likely due to token expiration. Our API tokens have a 1-hour expiration by default. Please ensure your application implements proper token refresh logic.",
    internalNotes: "Customer is on Enterprise plan - high priority. Technical team notified.",
    status: ResponseStatus.SENT,
    inquiryId: "1",
    inquiry: {
      id: "1",
      subject: "API Integration Issues",
      customer: {
        id: "1",
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice.johnson@techcorp.com",
      },
    },
    createdBy: {
      id: "1",
      email: "cso1@cnh.com",
      firstName: "John",
      lastName: "CSO",
      fullName: "John CSO",
      role: UserRole.CSO,
    },
    emailSent: true,
    emailSentAt: "2024-01-20T16:45:00Z",
    sentAt: "2024-01-20T16:45:00Z",
    createdAt: "2024-01-20T16:45:00Z",
    updatedAt: "2024-01-20T16:45:00Z",
  }
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to generate pagination response
const paginate = <T>(data: T[], page: number, limit: number) => {
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    data: data.slice(start, end),
    total: data.length,
    page,
    limit,
  };
};

export const dataProviderMock: DataProvider = {
  getApiUrl: () => "mock://api",

  getList: async ({ resource, pagination, filters, sorters }) => {
    await delay(500); // Simulate network delay

    const current = (pagination as any)?.current || 1;
    const pageSize = (pagination as any)?.pageSize || 10;

    let data: any[] = [];
    
    switch (resource) {
      case "customers":
        data = [...mockCustomers];
        break;
      case "inquiries":
        data = [...mockInquiries];
        break;
      case "responses":
        data = [...mockResponses];
        break;
      default:
        data = [];
    }

    // Apply filters
    if (filters) {
      filters.forEach((filter) => {
        if (filter.operator === "eq" && filter.value) {
          data = data.filter((item) => 
            String(item[filter.field]).toLowerCase().includes(String(filter.value).toLowerCase())
          );
        }
      });
    }

    // Apply sorting
    if (sorters && sorters.length > 0) {
      const sorter = sorters[0];
      data.sort((a, b) => {
        const aVal = a[sorter.field];
        const bVal = b[sorter.field];
        
        if (sorter.order === "asc") {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    const result = paginate(data, current, pageSize);
    
    return {
      data: result.data,
      total: result.total,
    };
  },

  getOne: async ({ resource, id }) => {
    await delay(300);

    let data: any = null;
    
    switch (resource) {
      case "customers":
        data = mockCustomers.find((item) => item.id === id);
        break;
      case "inquiries":
        data = mockInquiries.find((item) => item.id === id);
        break;
      case "responses":
        data = mockResponses.find((item) => item.id === id);
        break;
    }

    if (!data) {
      throw new Error(`${resource} with id ${id} not found`);
    }

    return { data };
  },

  create: async ({ resource, variables }) => {
    await delay(500);

    const newId = String(Date.now());
    const newItem = {
      id: newId,
      ...variables,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    switch (resource) {
      case "customers":
        mockCustomers.push(newItem as unknown as Customer);
        break;
      case "inquiries":
        mockInquiries.push(newItem as unknown as Inquiry);
        break;
      case "responses":
        mockResponses.push(newItem as unknown as Response);
        break;
    }

    return { data: newItem as any };
  },

  update: async ({ resource, id, variables }) => {
    await delay(500);

    let data: any = null;
    
    switch (resource) {
      case "customers":
        const customerIndex = mockCustomers.findIndex((item) => item.id === id);
        if (customerIndex >= 0) {
          mockCustomers[customerIndex] = { ...mockCustomers[customerIndex], ...variables, updatedAt: new Date().toISOString() };
          data = mockCustomers[customerIndex];
        }
        break;
      case "inquiries":
        const inquiryIndex = mockInquiries.findIndex((item) => item.id === id);
        if (inquiryIndex >= 0) {
          mockInquiries[inquiryIndex] = { ...mockInquiries[inquiryIndex], ...variables, updatedAt: new Date().toISOString() };
          data = mockInquiries[inquiryIndex];
        }
        break;
      case "responses":
        const responseIndex = mockResponses.findIndex((item) => item.id === id);
        if (responseIndex >= 0) {
          mockResponses[responseIndex] = { ...mockResponses[responseIndex], ...variables, updatedAt: new Date().toISOString() };
          data = mockResponses[responseIndex];
        }
        break;
    }

    if (!data) {
      throw new Error(`${resource} with id ${id} not found`);
    }

    return { data };
  },

  deleteOne: async ({ resource, id }) => {
    await delay(500);

    let index = -1;
    
    switch (resource) {
      case "customers":
        index = mockCustomers.findIndex((item) => item.id === id);
        if (index >= 0) mockCustomers.splice(index, 1);
        break;
      case "inquiries":
        index = mockInquiries.findIndex((item) => item.id === id);
        if (index >= 0) mockInquiries.splice(index, 1);
        break;
      case "responses":
        index = mockResponses.findIndex((item) => item.id === id);
        if (index >= 0) mockResponses.splice(index, 1);
        break;
    }

    if (index < 0) {
      throw new Error(`${resource} with id ${id} not found`);
    }

    return { data: { id } as any };
  },

  getMany: async ({ resource, ids }) => {
    await delay(300);

    let data: any[] = [];
    
    switch (resource) {
      case "customers":
        data = mockCustomers.filter((item) => ids.includes(item.id));
        break;
      case "inquiries":
        data = mockInquiries.filter((item) => ids.includes(item.id));
        break;
      case "responses":
        data = mockResponses.filter((item) => ids.includes(item.id));
        break;
    }

    return { data };
  },

  updateMany: async ({ resource, ids, variables }) => {
    await delay(500);

    const promises = ids.map((id) =>
      dataProviderMock.update!({ resource, id, variables, meta: {} })
    );

    const results = await Promise.all(promises);
    return { data: results.map(r => r.data) as any };
  },

  deleteMany: async ({ resource, ids }) => {
    await delay(500);

    const promises = ids.map((id) => 
      dataProviderMock.deleteOne!({ resource, id, variables: {}, meta: {} })
    );

    await Promise.all(promises);
    return { data: ids.map((id) => ({ id } as any)) };
  },

  custom: async ({ url, method = "GET", payload }) => {
    await delay(300);
    
    // Handle custom endpoints
    console.log("Mock custom request:", { url, method, payload });
    
    return { data: { message: "Mock custom response" } as any };
  },
};