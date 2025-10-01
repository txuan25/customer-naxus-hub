# Technical Decisions & Architecture Documentation

## Project Overview
**Project Name:** Customer Nexus Hub (CNH)
**Type:** Customer Relationship Management (CRM) System
**Architecture:** Monorepo with separate Backend and Frontend packages
**Created:** October 2025

## Core Technology Stack

### Backend
- **Framework:** NestJS (Node.js)
- **Language:** TypeScript
- **Database:** PostgreSQL 15
- **Cache/Session:** Redis 7
- **ORM:** TypeORM
- **Authentication:** JWT with Refresh Tokens
- **API Documentation:** Swagger/OpenAPI

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Admin Framework:** Refine
- **Language:** TypeScript
- **State Management:** React Query (via Refine)
- **UI Components:** Ant Design (via Refine)

## Key Architectural Decisions

### 1. Monorepo Structure
**Decision:** Use pnpm workspaces for monorepo management
**Reasoning:**
- Shared dependencies between frontend and backend
- Easier cross-package development
- Consistent versioning and deployment
- Better TypeScript type sharing

### 2. Path Aliases
**Decision:** Implement TypeScript path aliases (`@backend/*`, `@entities/*`, etc.)
**Reasoning:**
- Cleaner imports without relative paths (`../../../`)
- Easier refactoring and file movement
- Better code readability
- Consistent import patterns across the codebase

**Configuration:**
```typescript
// tsconfig.json
{
  "paths": {
    "@backend/*": ["src/*"],
    "@entities/*": ["src/entities/*"],
    "@modules/*": ["src/modules/*"],
    "@common/*": ["src/common/*"],
    "@config/*": ["src/config/*"]
  }
}
```

### 3. Repository Pattern
**Decision:** Use TypeORM's built-in repository pattern with service layer
**Reasoning:**
- NestJS best practices alignment
- Clean separation of concerns
- TypeORM repositories provide sufficient abstraction
- Avoid over-engineering with custom repositories unless needed

**Pattern:**
```typescript
// Service uses injected repository
@Injectable()
export class Service {
  constructor(
    @InjectRepository(Entity)
    private repository: Repository<Entity>,
  ) {}
}
```

### 4. Authentication & Authorization
**Decision:** JWT with Refresh Tokens + Role-Based Access Control (RBAC)
**Reasoning:**
- Stateless authentication for scalability
- Refresh tokens for security (short-lived access tokens)
- Three roles (Admin, Manager, CSO) match business requirements
- Guards and decorators for clean authorization code

**Implementation:**
- Access Token: 15 minutes expiry
- Refresh Token: 7 days expiry
- Roles: ADMIN, MANAGER, CSO
- Guards: JwtAuthGuard, RolesGuard

### 5. Database Design
**Decision:** Normalized relational database with TypeORM entities
**Reasoning:**
- Strong data consistency requirements
- Complex relationships between entities
- PostgreSQL for ACID compliance
- TypeORM for type safety and migrations

**Core Entities:**
- User (system users with roles)
- Customer (CRM customers)
- Inquiry (customer feedback/questions)
- Response (CSO responses with approval workflow)

### 6. API Design
**Decision:** RESTful API with Swagger documentation
**Reasoning:**
- Standard REST patterns for CRUD operations
- Swagger for automatic API documentation
- DTOs for validation and transformation
- Pagination, filtering, and sorting support

### 7. Error Handling
**Decision:** Centralized exception filters with structured errors
**Reasoning:**
- Consistent error responses
- Proper HTTP status codes
- Detailed error messages in development
- Security-conscious error messages in production

### 8. Security Features
**Decision:** Comprehensive security middleware and best practices
**Reasoning:**
- Helmet for security headers
- Rate limiting to prevent abuse
- CORS configuration for frontend
- bcrypt for password hashing
- Input validation with class-validator

### 9. Development Environment
**Decision:** Docker Compose for local development
**Reasoning:**
- Consistent development environment
- Easy setup for new developers
- Isolated database and Redis instances
- Production-like environment locally

**Services:**
- PostgreSQL on port 5432
- Redis on port 6379
- Auto-initialization scripts

### 10. Seed Data Strategy
**Decision:** Multiple seed scripts for different scenarios
**Reasoning:**
- Basic seed for minimal data (users, customers)
- Full seed for complete demo data (with inquiries, responses)
- Faker.js for realistic test data
- Separate scripts for flexibility

## Module Architecture

### Core Modules

#### Auth Module
- JWT strategy implementation
- Refresh token handling
- Login/logout endpoints
- Password hashing with bcrypt

#### Customer Module
- Full CRUD operations
- Status and segment management
- Pagination and filtering
- Metadata support

#### Inquiry Module
- Customer feedback handling
- Priority and category system
- Assignment to CSO
- Status workflow (Pending → In Progress → Responded → Closed)

#### Response Module
- CSO response creation
- Manager approval workflow
- Status: Draft → Pending Approval → Approved/Rejected → Sent
- Audit trail (who approved, when, notes)

## API Endpoints Structure

### Authentication
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout

### Customers
- GET /customers (paginated, filtered)
- GET /customers/:id
- POST /customers
- PATCH /customers/:id
- DELETE /customers/:id

### Inquiries
- GET /inquiries (paginated, filtered)
- GET /inquiries/:id
- GET /inquiries/statistics
- POST /inquiries
- PATCH /inquiries/:id
- POST /inquiries/:id/assign
- PATCH /inquiries/:id/status
- DELETE /inquiries/:id

### Responses
- GET /responses (paginated, filtered)
- GET /responses/:id
- POST /responses (create draft)
- PATCH /responses/:id (update draft)
- POST /responses/:id/submit (submit for approval)
- POST /responses/:id/approve (manager only)
- POST /responses/:id/reject (manager only)
- DELETE /responses/:id

## Performance Considerations

### Caching Strategy
- Redis for session management
- Cache frequently accessed data
- Cache invalidation on updates
- Rate limiting with Redis store

### Database Optimization
- Indexes on frequently queried fields
- Composite indexes for complex queries
- Lazy loading for relations
- Query optimization with QueryBuilder

### Pagination
- Default limit: 10 items
- Maximum limit: 100 items
- Cursor-based pagination for large datasets
- Total count included in responses

## Testing Strategy

### Backend Testing
- Unit tests for services
- Integration tests for controllers
- E2E tests for complete workflows
- Test database with Docker

### Frontend Testing
- Component testing with React Testing Library
- Integration tests for forms
- E2E tests with Cypress/Playwright
- Mock API for isolated testing

## Deployment Considerations

### Environment Variables
- Separate .env files for dev/staging/production
- Secrets management (JWT secrets, DB passwords)
- Configuration validation on startup

### Database Migrations
- TypeORM migrations for schema changes
- Seed data for initial deployment
- Rollback strategy for failed migrations

### Monitoring
- Structured logging with context
- Error tracking (Sentry integration ready)
- Performance monitoring hooks
- Health check endpoints

## Future Enhancements

### Planned Features
1. Email notifications for approved responses
2. Bulk operations for inquiries
3. Export functionality (CSV, Excel)
4. Advanced analytics dashboard
5. WebSocket for real-time updates
6. Multi-language support
7. File attachments for inquiries
8. Customer portal for self-service

### Technical Debt
1. Add comprehensive test coverage
2. Implement caching layer
3. Add API versioning
4. Optimize database queries
5. Add request/response logging
6. Implement audit logging
7. Add data archiving strategy

## Development Workflow

### Branch Strategy
- main: production-ready code
- develop: integration branch
- feature/*: new features
- bugfix/*: bug fixes
- hotfix/*: urgent production fixes

### Code Style
- ESLint + Prettier configuration
- Pre-commit hooks with Husky
- Conventional commits
- PR reviews required

### Documentation
- README.md for setup instructions
- API documentation via Swagger
- Code comments for complex logic
- Architecture Decision Records (ADRs)

## Maintenance Notes

### Regular Tasks
- Update dependencies monthly
- Review and rotate logs
- Database backup verification
- Security audit quarterly
- Performance profiling

### Troubleshooting Guide
- Check Docker containers: `docker compose ps`
- View logs: `docker compose logs [service]`
- Database connection: Check .env configuration
- Clear cache: Redis FLUSHALL command
- Reset database: Drop and recreate with migrations

## Contact & Support

### Development Team
- Architecture decisions: Team lead approval required
- Code reviews: At least one approval needed
- Emergency contacts: See team documentation

### Resources
- Project Repository: [GitHub URL]
- API Documentation: http://localhost:3000/api/docs
- Issue Tracker: [Issue tracker URL]
- CI/CD Pipeline: [Pipeline URL]

---

Last Updated: October 2025
Version: 1.0.0