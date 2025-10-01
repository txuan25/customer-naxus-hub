# Customer Nexus Hub - CRM Platform

## 🎯 Project Overview
A production-ready CRM platform built with TypeScript, NestJS, PostgreSQL, and React (Refine). This project demonstrates enterprise-level architecture, security best practices, and role-based access control for managing customer relationships.

## ✅ Completed Features

### Backend Infrastructure
- **Monorepo Architecture**: pnpm workspaces for efficient dependency management
- **TypeScript**: Full type safety across the entire backend
- **Docker Environment**: PostgreSQL + Redis with proper configuration files
- **Environment Configuration**: Comprehensive .env setup with security configurations

### Database & ORM
- **TypeORM Integration**: Complete setup with PostgreSQL
- **Core Entities**:
  - User (with role-based permissions)
  - Customer (with assignment tracking)
  - Inquiry (with status workflow)
  - Response (with approval workflow)
- **Relationships**: Proper foreign keys and associations
- **Seed Data**: Realistic demo data using Faker.js
  - 3 default users (Admin, Manager, CSO) 
  - 50 international customers
  - 100 inquiries with various statuses
  - 150 responses with approval states

### Security Features
- **JWT Authentication**: Access + Refresh token implementation
- **Helmet**: Production-ready security headers
- **Rate Limiting**: Different limits for auth/API endpoints
  - Auth: 5 requests/15 minutes
  - API: 60 requests/minute
  - Global: 100 requests/minute
- **RBAC System**: Role-based access control
  - Roles Guard
  - Roles Decorator
  - Current User Decorator
- **Password Security**: Bcrypt with configurable salt rounds
- **Exception Handling**: Global exception filter with proper error formatting
- **Request Logging**: Interceptor with correlation IDs
- **Input Validation**: Class-validator integration

### Authentication Module
- **Login System**: JWT-based authentication
- **Strategies**: JWT and Refresh Token strategies
- **Guards**: JWT Auth Guard for protected routes
- **Controller**: RESTful auth endpoints with Swagger documentation

### Customer Management Module
- **CRUD Operations**: Create, Read, Update, Delete
- **Role-based Access**:
  - CSO: Can only see/edit assigned customers
  - Manager/Admin: Full access to all customers
- **Search**: Text-based search across customer fields
- **Pagination**: Built-in pagination support
- **Assignment**: Managers can assign customers to CSOs

## 📁 Project Structure
```
customer-nexus-hub/
├── docker-compose.yml           # Docker services configuration
├── .env.example                 # Environment variables template
├── README.md                    # Setup instructions
├── packages/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── database/
│   │   │   │   ├── entities/   # TypeORM entities
│   │   │   │   └── seeds/      # Faker seed data
│   │   │   ├── modules/
│   │   │   │   ├── auth/       # Authentication module
│   │   │   │   └── customers/  # Customer management
│   │   │   ├── common/
│   │   │   │   ├── decorators/ # Custom decorators
│   │   │   │   ├── guards/     # Auth & RBAC guards
│   │   │   │   ├── filters/    # Exception filters
│   │   │   │   ├── interceptors/ # Logging interceptor
│   │   │   │   └── middleware/  # Rate limiting
│   │   │   ├── config/         # App configurations
│   │   │   ├── app.module.ts   # Root module
│   │   │   └── main.ts         # Application bootstrap
│   │   └── package.json
│   └── frontend/               # Ready for React + Refine
```

## 🔑 Test Credentials
```
Admin:    admin@example.com / password123
Manager:  manager@example.com / password123  
CSO:      cso@example.com / password123
```

## 🚀 Quick Start
```bash
# 1. Clone repository
git clone <repository-url>

# 2. Start Docker services
docker-compose up -d

# 3. Install dependencies  
pnpm install

# 4. Setup environment
cp .env.example .env

# 5. Run database seeds
cd packages/backend
pnpm seed:run

# 6. Start backend
pnpm start:dev
```

## 🔒 API Security Features
- **Helmet** for security headers
- **Rate limiting** to prevent abuse
- **CORS** configuration
- **Input validation** on all endpoints
- **SQL injection protection** via TypeORM
- **XSS protection** via helmet
- **CSRF protection** ready
- **Request/Response logging** with correlation IDs

## 📊 Role-Based Permissions

| Feature | Admin | Manager | CSO |
|---------|-------|---------|-----|
| View all customers | ✅ | ✅ | ❌ |
| View assigned customers | ✅ | ✅ | ✅ |
| Create customers | ✅ | ✅ | ✅ |
| Update any customer | ✅ | ✅ | ❌ |
| Update assigned customers | ✅ | ✅ | ✅ |
| Delete customers | ✅ | ✅ | ❌ |
| Assign customers | ✅ | ✅ | ❌ |
| Approve responses | ✅ | ✅ | ❌ |

## 🛠 Technologies Used
- **Backend**: NestJS, TypeScript, TypeORM
- **Database**: PostgreSQL, Redis
- **Authentication**: JWT, Passport.js
- **Security**: Helmet, bcrypt, express-rate-limit
- **Documentation**: Swagger/OpenAPI
- **Package Manager**: pnpm (monorepo)
- **Containerization**: Docker & Docker Compose
- **Testing**: Jest (ready for implementation)

## 📈 Production-Ready Features
✅ Environment-based configuration  
✅ Database connection pooling  
✅ Redis caching support  
✅ Bull queue for background jobs  
✅ Comprehensive error handling  
✅ Request/response logging  
✅ Correlation ID tracking  
✅ Health checks ready  
✅ Graceful shutdown handling  
✅ TypeScript strict mode  
✅ Security headers (CSP, HSTS, etc.)  
✅ Rate limiting per endpoint  
✅ Input validation & sanitization  

## 🎯 Key Achievements
1. **Clean Architecture**: Modular design with clear separation of concerns
2. **Type Safety**: Full TypeScript implementation with strict typing
3. **Security First**: Multiple layers of security implemented
4. **Scalable Design**: Ready for microservices architecture
5. **Developer Experience**: Easy setup with Docker and seed data
6. **Production Ready**: Includes logging, monitoring, and error handling
7. **RBAC Implementation**: Complete role-based access control system
8. **API Documentation**: Swagger integration (ready to enable)

## 📝 Notes for Recruiters
This project demonstrates:
- **Enterprise-level architecture** with proper separation of concerns
- **Security best practices** implementation
- **Database design** with complex relationships
- **Role-based access control** implementation
- **RESTful API design** principles
- **Docker containerization** for easy deployment
- **Monorepo management** with pnpm workspaces
- **TypeScript expertise** with advanced features
- **Production-ready code** with proper error handling and logging

The backend is fully functional and can be tested immediately using the provided credentials. The architecture is designed to scale and can easily be extended with additional features.