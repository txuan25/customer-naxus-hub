import { DataProvider } from "@refinedev/core";
import { TOKEN_KEY } from "./authProvider";

const API_BASE_URL = "http://localhost:3000/api/v1";

// Helper function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.error?.message || error.message || "Request failed");
  }
  return response.json();
};

export const dataProvider: DataProvider = {
  getApiUrl: () => API_BASE_URL,

  // Get list of resources with pagination
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    const current = (pagination as any)?.current || 1;
    const pageSize = (pagination as any)?.pageSize || 10;
    
    const params = new URLSearchParams({
      page: current.toString(),
      limit: pageSize.toString(),
    });

    // Add filters to query params
    if (filters) {
      console.log('DataProvider filters received:', filters);
      filters.forEach((filter) => {
        console.log('Processing filter:', filter);
        if (filter.operator === "eq" && filter.value) {
          if (filter.field === "assignedToMe") {
            console.log('Adding assignedToMe filter:', filter.value);
            params.append("assignedToMe", filter.value);
          } else if (filter.field === "status" && Array.isArray(filter.value)) {
            // Handle multiple status values
            const statusValues = filter.value.join(",");
            console.log('Adding status filter:', statusValues);
            params.append("status", statusValues);
          } else {
            console.log('Adding generic filter:', filter.field, filter.value);
            params.append(filter.field, filter.value);
          }
        } else {
          console.log('Skipping filter (no value or wrong operator):', filter);
        }
      });
    }

    console.log('Final URL params:', params.toString());

    // Add sorting to query params
    if (sorters) {
      sorters.forEach((sorter) => {
        params.append("sortBy", sorter.field);
        params.append("sortOrder", sorter.order);
      });
    }

    const response = await fetch(`${API_BASE_URL}/${resource}?${params}`, {
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);

    return {
      data: data.items || [],
      total: data.total || 0,
    };
  },

  // Get one resource by ID
  getOne: async ({ resource, id, meta }) => {
    const response = await fetch(`${API_BASE_URL}/${resource}/${id}`, {
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    return { data };
  },

  // Create a new resource
  create: async ({ resource, variables, meta }) => {
    const response = await fetch(`${API_BASE_URL}/${resource}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(variables),
    });

    const data = await handleResponse(response);
    return { data };
  },

  // Update an existing resource
  update: async ({ resource, id, variables, meta }) => {
    const response = await fetch(`${API_BASE_URL}/${resource}/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(variables),
    });

    const data = await handleResponse(response);
    return { data };
  },

  // Delete a resource
  deleteOne: async ({ resource, id, variables, meta }) => {
    const response = await fetch(`${API_BASE_URL}/${resource}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    await handleResponse(response);
    return { data: { id } as any };
  },

  // Get many resources by IDs
  getMany: async ({ resource, ids, meta }) => {
    const promises = ids.map((id) =>
      fetch(`${API_BASE_URL}/${resource}/${id}`, {
        headers: getAuthHeaders(),
      }).then(handleResponse)
    );

    const data = await Promise.all(promises);
    return { data };
  },

  // Custom method for updating multiple resources
  updateMany: async ({ resource, ids, variables, meta }) => {
    const promises = ids.map((id) =>
      fetch(`${API_BASE_URL}/${resource}/${id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(variables),
      }).then(handleResponse)
    );

    const data = await Promise.all(promises);
    return { data };
  },

  // Custom method for deleting multiple resources
  deleteMany: async ({ resource, ids, variables, meta }) => {
    const promises = ids.map((id) =>
      fetch(`${API_BASE_URL}/${resource}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      }).then(handleResponse)
    );

    await Promise.all(promises);
    return { data: ids.map((id) => ({ id } as any)) };
  },

  // Custom method for handling special endpoints
  custom: async ({ url, method = "GET", filters, sorters, payload, query, headers, meta }) => {
    let requestUrl = `${API_BASE_URL}${url}`;

    // Add query parameters
    if (query) {
      const params = new URLSearchParams(query);
      requestUrl += `?${params}`;
    }

    const config: RequestInit = {
      method,
      headers: {
        ...getAuthHeaders(),
        ...headers,
      },
    };

    if (payload) {
      config.body = JSON.stringify(payload);
    }

    const response = await fetch(requestUrl, config);
    const data = await handleResponse(response);

    return { data };
  },
};

// Extended response actions following backend API structure
export const responseActions = {
  submitForApproval: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/responses/${id}/submit`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    return { data };
  },

  approve: async (id: string, approvalNotes?: string) => {
    const response = await fetch(`${API_BASE_URL}/responses/${id}/approve`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ approvalNotes }),
    });

    const data = await handleResponse(response);
    return { data };
  },

  reject: async (id: string, rejectionReason: string) => {
    const response = await fetch(`${API_BASE_URL}/responses/${id}/reject`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ rejectionReason }),
    });

    const data = await handleResponse(response);
    return { data };
  },
};