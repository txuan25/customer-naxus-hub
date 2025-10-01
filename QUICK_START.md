# Quick Start Guide - Customer Nexus Hub

## Current Project Status

✅ **Completed:**
- Docker infrastructure (PostgreSQL + Redis)
- Backend structure with NestJS
- Authentication module with JWT
- Customer management module
- RBAC system (Admin, Manager, CSO roles)
- Security features (Helmet, rate limiting, CORS)
- Database entities and TypeORM setup
- Seed data script (ready but waiting for all modules)

⏳ **In Progress:**
- Inquiry module (customer feedback/questions)
- Response module (CSO responses to inquiries)
- Approval workflow (manager approval for responses)
- Swagger API documentation
- Frontend with React + Refine

## Quick Start (What's Working Now)

### 1. Start Docker Services
```bash
cd customer-nexus-hub
docker compose up -d
```

✅ This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- Database `customer_nexus_hub` is created automatically
- User `crm_user` with password `crmpass123`

### 2. Check Services Status
```bash
# Check PostgreSQL
docker compose exec postgres psql -U postgres -c '\l' | grep customer_nexus_hub

# Check Redis
docker compose exec redis redis-cli ping
```

### 3. Current Database Schema
The following tables will be created when backend starts:
- `users` - System users with roles
- `customers` - Customer information
- `inquiries` - Customer feedback/questions (pending implementation)
- `responses` - CSO responses (pending implementation)

### 4. Why Seed Data Can't Run Yet

The seed data script (`packages/backend/src/database/seed.ts`) is ready but requires all modules to be complete:

```typescript
// Current seed data includes:
- 3 system users (Admin, Manager, CSO)
- 50 realistic customers with Faker data
- 100 inquiries from customers (needs Inquiry module)
- 80 responses from CSOs (needs Response module)
- 60 approved responses by Manager (needs approval workflow)
```

## What You Can Test Now

### 1. Docker Infrastructure ✅
```bash
# Everything is running
docker compose ps
```

### 2. Database Connection ✅
```bash
# Test database access
docker compose exec -e PGPASSWORD=crmpass123 postgres \
  psql -h localhost -U crm_user -d customer_nexus_hub \
  -c "SELECT 'Database connected successfully!' as status;"
```

### 3. Redis Cache ✅
```bash
# Test Redis
docker compose exec redis redis-cli SET test "Hello CRM"
docker compose exec redis redis-cli GET test
```

## Next Steps to Complete

1. **Inquiry Module** - Handle customer feedback/questions
2. **Response Module** - CSO responses to inquiries
3. **Approval Workflow** - Manager approval system
4. **Run Seed Data** - Once all modules are ready
5. **Start Backend** - `pnpm install && pnpm start:dev`
6. **Test APIs** - Use test script or Swagger
7. **Build Frontend** - React + Refine interface

## Module Dependencies

```
Auth Module ✅
    ↓
Customer Module ✅
    ↓
Inquiry Module ⏳ (needed for seed data)
    ↓
Response Module ⏳ (needed for seed data)
    ↓
Seed Data can run
```

## When Everything is Ready

Once all modules are complete, you can run:

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Run database migrations
cd packages/backend
pnpm typeorm migration:run

# Run seed data
pnpm seed:run

# Start backend
pnpm start:dev

# Test with sample users:
# admin@nexus.com / Admin123!@#
# manager@nexus.com / Manager123!@#
# cso@nexus.com / Cso123!@#
```

## Current Architecture

```
customer-nexus-hub/
├── docker-compose.yml        ✅ Working
├── packages/
│   ├── backend/             
│   │   ├── auth/            ✅ Complete
│   │   ├── customers/       ✅ Complete
│   │   ├── inquiries/       ⏳ In progress
│   │   └── responses/       ⏳ In progress
│   └── frontend/            ⏳ Not started
└── docker/
    ├── postgres/            ✅ Working
    └── redis/               ✅ Working
```

---

**Note:** The seed data is designed to create a realistic demo environment with 50 customers, 100 inquiries, and various response states. However, it can only run after the Inquiry and Response modules are implemented because it needs those entities to exist in the database.