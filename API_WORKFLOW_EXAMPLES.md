# API Workflow Examples - Customer Service Operations

This document provides complete workflow examples using curl commands for the Customer Nexus Hub API.

## Prerequisites

Make sure the backend server is running:
```bash
cd customer-nexus-hub && pnpm dev:backend
```

The API is available at: http://localhost:3000/api/v1

## Test Users Created by Migrations

- **Admin**: admin@crm.com / password123
- **Manager**: manager@crm.com / password123  
- **CSO 1**: cso1@crm.com / password123
- **CSO 2**: cso2@crm.com / password123

---

## Workflow 1: CSO Handling Customer Inquiries

### Step 1: CSO Login

```bash
# Login as CSO
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cso1@crm.com",
    "password": "password123"
  }'
```

Expected Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    "email": "cso1@crm.com",
    "firstName": "Aliyah",
    "lastName": "VonRueden-Emmerich",
    "role": "cso"
  }
}
```

Save the `access_token` for subsequent requests:
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Step 2: List All Pending Inquiries

```bash
# Get all pending inquiries
curl -X GET "http://localhost:3000/api/v1/inquiries?status=pending&page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

Expected Response:
```json
{
  "data": [
    {
      "id": "99fb9bab-f082-4845-9255-d983311d578e",
      "subject": "Titulus vacuus denuo appono cunabula deinde.",
      "message": "Et corrumpo ventus odio sono tandem...",
      "status": "pending",
      "priority": "urgent",
      "category": "technical",
      "customerId": "f668d6be-72a0-4e04-9ec8-d671e22ecf6c",
      "customer": {
        "id": "f668d6be-72a0-4e04-9ec8-d671e22ecf6c",
        "firstName": "Emil",
        "lastName": "Mayer",
        "email": "emil_mayer96@gmail.com",
        "company": "Glover, Satterfield and Crooks"
      },
      "assignedTo": null,
      "createdAt": "2025-01-10T07:49:11.000Z",
      "updatedAt": "2025-01-10T07:49:11.000Z"
    }
    // ... more inquiries
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

### Step 3: View Single Inquiry Details

```bash
# Get specific inquiry details
curl -X GET "http://localhost:3000/api/v1/inquiries/99fb9bab-f082-4845-9255-d983311d578e" \
  -H "Authorization: Bearer $TOKEN"
```

### Step 4: Assign Inquiry to Self

```bash
# Assign inquiry to current CSO
curl -X PATCH "http://localhost:3000/api/v1/inquiries/99fb9bab-f082-4845-9255-d983311d578e/assign" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assignedTo": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13"
  }'
```

### Step 5: Update Inquiry Status to In Progress

```bash
# Update inquiry status
curl -X PATCH "http://localhost:3000/api/v1/inquiries/99fb9bab-f082-4845-9255-d983311d578e" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress"
  }'
```

### Step 6: Create Response to Inquiry

```bash
# Create response draft
curl -X POST "http://localhost:3000/api/v1/responses" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inquiryId": "99fb9bab-f082-4845-9255-d983311d578e",
    "responseText": "Dear Emil,\n\nThank you for reaching out to us regarding your technical issue.\n\nAfter reviewing your concern, I would like to provide the following solution:\n\n1. Please ensure your system meets the minimum requirements\n2. Try clearing your browser cache and cookies\n3. Update to the latest version of our software\n\nIf you continue to experience issues, please dont hesitate to contact us again.\n\nBest regards,\nCustomer Service Team",
    "status": "draft"
  }'
```

Expected Response:
```json
{
  "id": "new-response-id-here",
  "inquiryId": "99fb9bab-f082-4845-9255-d983311d578e",
  "responseText": "Dear Emil...",
  "status": "draft",
  "responderId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
  "createdAt": "2025-01-10T08:00:00.000Z",
  "updatedAt": "2025-01-10T08:00:00.000Z"
}
```

Save the response ID:
```bash
export RESPONSE_ID="new-response-id-here"
```

### Step 7: Submit Response for Approval

```bash
# Submit response for manager approval
curl -X PATCH "http://localhost:3000/api/v1/responses/$RESPONSE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "pending_approval"
  }'
```

---

## Workflow 2: Manager Approving/Rejecting Responses

### Step 1: Manager Login

```bash
# Login as Manager
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@crm.com",
    "password": "password123"
  }'
```

Save the manager token:
```bash
export MANAGER_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Step 2: List Responses Pending Approval

```bash
# Get all responses pending approval
curl -X GET "http://localhost:3000/api/v1/responses?status=pending_approval" \
  -H "Authorization: Bearer $MANAGER_TOKEN"
```

### Step 3A: Approve Response

```bash
# Approve response
curl -X PATCH "http://localhost:3000/api/v1/responses/$RESPONSE_ID/approve" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approvalNotes": "Good response, well structured and professional."
  }'
```

Expected Response:
```json
{
  "id": "new-response-id-here",
  "status": "approved",
  "approvedById": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
  "approvedAt": "2025-01-10T08:15:00.000Z",
  "approvalNotes": "Good response, well structured and professional."
}
```

### Step 3B: Or Reject Response (Alternative)

```bash
# Reject response
curl -X PATCH "http://localhost:3000/api/v1/responses/$RESPONSE_ID/reject" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rejectionReason": "Response needs more technical details and clearer instructions."
  }'
```

### Step 4: Send Approved Response to Customer

```bash
# Send response to customer (as CSO or Manager)
curl -X POST "http://localhost:3000/api/v1/responses/$RESPONSE_ID/send" \
  -H "Authorization: Bearer $MANAGER_TOKEN"
```

Expected Response:
```json
{
  "id": "new-response-id-here",
  "status": "sent",
  "sentAt": "2025-01-10T08:20:00.000Z",
  "message": "Response sent successfully to customer"
}
```

### Step 5: Mark Inquiry as Responded

```bash
# Update inquiry status to responded
curl -X PATCH "http://localhost:3000/api/v1/inquiries/99fb9bab-f082-4845-9255-d983311d578e" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "responded"
  }'
```

---

## Workflow 3: Admin Dashboard Operations

### Step 1: Admin Login

```bash
# Login as Admin
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@crm.com",
    "password": "password123"
  }'
```

Save admin token:
```bash
export ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Step 2: Get System Statistics

```bash
# Get dashboard statistics
curl -X GET "http://localhost:3000/api/v1/dashboard/statistics" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Expected Response:
```json
{
  "inquiries": {
    "total": 30,
    "pending": 15,
    "in_progress": 5,
    "responded": 6,
    "closed": 4
  },
  "responses": {
    "total": 17,
    "draft": 5,
    "pending_approval": 3,
    "approved": 4,
    "rejected": 1,
    "sent": 4
  },
  "customers": {
    "total": 20,
    "active": 8,
    "inactive": 7,
    "suspended": 5
  },
  "users": {
    "total": 4,
    "admin": 1,
    "manager": 1,
    "cso": 2
  }
}
```

### Step 3: Get Performance Metrics

```bash
# Get CSO performance metrics
curl -X GET "http://localhost:3000/api/v1/dashboard/performance?period=month" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Step 4: Export Reports

```bash
# Export inquiries report (CSV)
curl -X GET "http://localhost:3000/api/v1/reports/inquiries?format=csv&from=2025-01-01&to=2025-01-31" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -o inquiries_report.csv
```

---

## Workflow 4: Customer Management

### Step 1: List All Customers

```bash
# Get customers with pagination and filters
curl -X GET "http://localhost:3000/api/v1/customers?status=active&segment=premium&page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Step 2: View Customer History

```bash
# Get customer details with inquiry history
curl -X GET "http://localhost:3000/api/v1/customers/f668d6be-72a0-4e04-9ec8-d671e22ecf6c" \
  -H "Authorization: Bearer $TOKEN"
```

Expected Response:
```json
{
  "id": "f668d6be-72a0-4e04-9ec8-d671e22ecf6c",
  "firstName": "Emil",
  "lastName": "Mayer",
  "email": "emil_mayer96@gmail.com",
  "company": "Glover, Satterfield and Crooks",
  "status": "active",
  "segment": "basic",
  "totalSpent": 56870.51,
  "orderCount": 125,
  "inquiries": [
    {
      "id": "99fb9bab-f082-4845-9255-d983311d578e",
      "subject": "Titulus vacuus denuo appono cunabula deinde.",
      "status": "pending",
      "priority": "urgent",
      "createdAt": "2025-01-10T07:49:11.000Z"
    }
    // ... more inquiries
  ]
}
```

### Step 3: Update Customer Information

```bash
# Update customer segment based on activity
curl -X PATCH "http://localhost:3000/api/v1/customers/f668d6be-72a0-4e04-9ec8-d671e22ecf6c" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "segment": "premium",
    "metadata": {
      "notes": "Upgraded to premium due to high order value",
      "upgradeDate": "2025-01-10"
    }
  }'
```

---

## Workflow 5: Advanced Search and Filtering

### Search Inquiries by Keywords

```bash
# Search inquiries
curl -X GET "http://localhost:3000/api/v1/inquiries/search?q=technical%20issue&category=technical" \
  -H "Authorization: Bearer $TOKEN"
```

### Filter by Date Range

```bash
# Get inquiries from last 7 days
curl -X GET "http://localhost:3000/api/v1/inquiries?from=2025-01-03&to=2025-01-10&status=pending" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Priority Inquiries

```bash
# Get urgent inquiries needing immediate attention
curl -X GET "http://localhost:3000/api/v1/inquiries?priority=urgent&status=pending,in_progress" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Error Handling Examples

### Unauthorized Access

```bash
# Trying to access without token
curl -X GET "http://localhost:3000/api/v1/inquiries"
```

Expected Response:
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Missing or invalid authentication token"
}
```

### Invalid Data

```bash
# Creating response with invalid data
curl -X POST "http://localhost:3000/api/v1/responses" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inquiryId": "invalid-id",
    "responseText": ""
  }'
```

Expected Response:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "inquiryId",
      "message": "Invalid UUID format"
    },
    {
      "field": "responseText",
      "message": "Response text cannot be empty"
    }
  ]
}
```

---

## Batch Operations

### Bulk Update Inquiries

```bash
# Assign multiple inquiries at once
curl -X POST "http://localhost:3000/api/v1/inquiries/bulk-assign" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inquiryIds": [
      "99fb9bab-f082-4845-9255-d983311d578e",
      "d7966d97-9ad7-4201-81f8-443794fcebc4"
    ],
    "assignedTo": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13"
  }'
```

### Bulk Close Old Inquiries

```bash
# Close resolved inquiries older than 30 days
curl -X POST "http://localhost:3000/api/v1/inquiries/bulk-close" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "responded",
    "olderThanDays": 30
  }'
```

---

## WebSocket Real-time Updates (Optional)

For real-time notifications:

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:3000/notifications', {
  headers: {
    'Authorization': `Bearer ${TOKEN}`
  }
});

ws.on('message', (data) => {
  const notification = JSON.parse(data);
  console.log('New notification:', notification);
});
```

---

## Rate Limiting

The API implements rate limiting:
- 100 requests per minute for normal endpoints
- 10 requests per minute for authentication endpoints

Example rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704889260
```

---

## Testing Tips

1. Save tokens in environment variables for easy reuse
2. Use tools like `jq` for pretty JSON output:
   ```bash
   curl -X GET "http://localhost:3000/api/v1/inquiries" \
     -H "Authorization: Bearer $TOKEN" | jq '.'
   ```

3. Create shell scripts for common workflows:
   ```bash
   #!/bin/bash
   # login_cso.sh
   RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "cso1@crm.com", "password": "password123"}')
   
   export TOKEN=$(echo $RESPONSE | jq -r '.access_token')
   echo "Logged in successfully. Token saved to \$TOKEN"
   ```

4. Use Postman or Insomnia for more complex testing scenarios

---

## Notes

- All timestamps are in UTC format
- UUIDs are used for all entity IDs
- Passwords are hashed using bcrypt
- JWT tokens expire after 24 hours
- Refresh tokens are valid for 7 days