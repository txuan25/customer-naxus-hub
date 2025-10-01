# Customer Nexus Hub - API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "role": "ADMIN"
  }
}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

Response:
{
  "accessToken": "new_token",
  "refreshToken": "new_refresh_token",
  "user": {...}
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer {access_token}

Response:
{
  "message": "Successfully logged out"
}
```

## Customer Management

### Get All Customers
```http
GET /customers?page=1&limit=10
Authorization: Bearer {access_token}

Response:
{
  "data": [
    {
      "id": "uuid",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "company": "ACME Corp",
      "createdAt": "2024-01-01T00:00:00Z",
      "assignedTo": {...}
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

### Get Customer by ID
```http
GET /customers/{id}
Authorization: Bearer {access_token}

Response:
{
  "id": "uuid",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "inquiries": []
}
```

### Create Customer
```http
POST /customers
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "firstName": "New",
  "lastName": "Customer",
  "email": "new@example.com",
  "phone": "+9876543210",
  "company": "New Corp"
}

Response: Created customer object
```

### Update Customer
```http
PUT /customers/{id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "firstName": "Updated",
  "lastName": "Name"
}

Response: Updated customer object
```

### Delete Customer
```http
DELETE /customers/{id}
Authorization: Bearer {access_token}

Note: Only Admin and Manager roles can delete
Response: 200 OK
```

## Role-Based Access

| Endpoint | Admin | Manager | CSO | Notes |
|----------|-------|---------|-----|-------|
| POST /auth/login | ✅ | ✅ | ✅ | Public |
| POST /auth/refresh | ✅ | ✅ | ✅ | Public |
| POST /auth/logout | ✅ | ✅ | ✅ | Authenticated |
| GET /customers | ✅ | ✅ | ✅* | *CSO only sees assigned |
| GET /customers/:id | ✅ | ✅ | ✅* | *CSO only if assigned |
| POST /customers | ✅ | ✅ | ✅ | All can create |
| PUT /customers/:id | ✅ | ✅ | ✅* | *CSO only if assigned |
| DELETE /customers/:id | ✅ | ✅ | ❌ | CSO cannot delete |

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00Z",
  "path": "/api/v1/customers",
  "method": "POST",
  "correlationId": "uuid",
  "error": {
    "type": "ValidationError",
    "message": "Validation failed",
    "details": {...}
  }
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "timestamp": "2024-01-01T00:00:00Z",
  "path": "/api/v1/customers",
  "method": "GET",
  "correlationId": "uuid",
  "error": {
    "type": "UnauthorizedException",
    "message": "Unauthorized"
  }
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "timestamp": "2024-01-01T00:00:00Z",
  "path": "/api/v1/customers/123",
  "method": "DELETE",
  "correlationId": "uuid",
  "error": {
    "type": "ForbiddenException",
    "message": "You do not have permission to delete customers"
  }
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "timestamp": "2024-01-01T00:00:00Z",
  "path": "/api/v1/customers/invalid-id",
  "method": "GET",
  "correlationId": "uuid",
  "error": {
    "type": "NotFoundException",
    "message": "Customer with ID invalid-id not found"
  }
}
```

### 429 Too Many Requests
```json
{
  "statusCode": 429,
  "message": "Too many requests",
  "error": "Too Many Requests",
  "retryAfter": "2024-01-01T00:01:00Z"
}
```

## Headers

### Request Headers
- `Authorization: Bearer {access_token}` - Required for protected endpoints
- `Content-Type: application/json` - Required for POST/PUT requests
- `X-Correlation-Id: uuid` - Optional, for request tracking

### Response Headers
- `X-Correlation-Id: uuid` - Request tracking ID
- `X-Total-Count: number` - Total items for paginated responses
- `RateLimit-Limit: number` - Rate limit maximum
- `RateLimit-Remaining: number` - Remaining requests
- `RateLimit-Reset: datetime` - Rate limit reset time

## Rate Limits

- **Authentication endpoints**: 5 requests per 15 minutes
- **API endpoints**: 60 requests per minute
- **Global limit**: 100 requests per minute
- **File uploads**: 10 uploads per 15 minutes

## Test Credentials

```
Admin:    admin@example.com / password123
Manager:  manager@example.com / password123
CSO:      cso@example.com / password123