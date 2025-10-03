# Customer Nexus Hub - CRM Platform

A production-ready CRM platform built with TypeScript, NestJS, PostgreSQL, and React (Refine).

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose v2
- Node.js 18+
- pnpm 8+

```bash
git clone git@github.com:txuan25/customer-naxus-hub.git
cd customer-nexus-hub
```

### Local Development

1. Ensure Node.js 18+ is active and install pnpm 8+ (for example, run `corepack enable pnpm`).
2. For the first setup, execute `pnpm run setup` to install dependencies, run migrations, and seed sample data.
3. Start the backend API in one terminal: `pnpm dev:backend`.
4. Start the frontend in another terminal: `pnpm dev:frontend`.

```bash
pnpm run setup
pnpm dev:backend
pnpm dev:frontend
```

The backend is served at `http://localhost:3000`, the Swagger docs are available at `http://localhost:3000/api-docs`, and the frontend runs at `http://localhost:3001` by default.

To test the API, run:
```bash
./test-backend.sh
```

## 🔐 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password123 |
| Manager | manager@crm.com | password123 |
| CSO | cso1@crm.com | password123 |
| CSO | cso2@crm.com | password123 |

## 📁 Project Structure

```
customer-nexus-hub/
├── docker-compose.yml      # PostgreSQL + Redis
├── .env.example           # Environment template
├── test-backend.sh        # API test script
├── packages/
│   ├── backend/          # NestJS backend
│   └── frontend/         # React + Refine (ready)
└── docs/
    ├── API_ENDPOINTS.md   # API documentation
    └── PROJECT_SUMMARY.md # Complete overview
```

## 🛠 Technology Stack

- **Backend**: NestJS, TypeScript, TypeORM
- **Database**: PostgreSQL, Redis
- **Authentication**: JWT with Refresh Tokens
- **Security**: Helmet, Rate Limiting, CORS
- **Package Manager**: pnpm (monorepo)
- **Containerization**: Docker & Docker Compose

## 🔒 Security Features

- JWT + Refresh Token authentication
- Role-Based Access Control (RBAC)
- Rate limiting (Auth: 5/15min, API: 60/min)
- Helmet security headers
- Input validation & sanitization
- SQL injection protection via TypeORM
- XSS protection
- CORS configuration



## 🧪 Testing

```bash
# Run automated test script
./test-backend.sh

# Manual API testing
# 1. Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "manager@crm.com", "password": "password123"}'

# 2. Use token for protected endpoints
curl http://localhost:3000/api/v1/customers \
  -H "Authorization: Bearer <your-token>"
```

## 📚 Documentation

- [API Documentation](./API_ENDPOINTS.md) - Complete API reference
- [Project Summary](./PROJECT_SUMMARY.md) - Architecture overview
- [Backend Implementation](./BACKEND_IMPLEMENTATION.md) - Technical details

## 🐳 Docker Services

```bash
# Start services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f

# Stop services
docker compose down

# Stop and remove volumes
docker compose down -v
```

## 🔧 Development

```bash
# Backend development
cd packages/backend
pnpm start:dev    # Start with hot-reload
pnpm build       # Build for production
pnpm test        # Run tests

# Database
pnpm seed:run    # Run seed data
pnpm typeorm migration:generate  # Generate migration
pnpm typeorm migration:run       # Run migrations
```

## 🌟 Key Features

- **Authentication**: JWT-based with refresh tokens
- **RBAC**: Three roles (Admin, Manager, CSO)
- **Customer Management**: Full CRUD operations
- **Security**: Production-grade security measures
- **Logging**: Comprehensive with correlation IDs
- **Error Handling**: Global exception filters
- **Rate Limiting**: Endpoint-specific limits
- **Docker Ready**: Easy deployment
- **TypeScript**: Full type safety

## 📈 Production Readiness

✅ Environment-based configuration  
✅ Database connection pooling  
✅ Redis caching support  
✅ Bull queue for background jobs  
✅ Comprehensive error handling  
✅ Request/response logging  
✅ Correlation ID tracking  
✅ Health checks ready  
✅ Graceful shutdown handling  
✅ Security headers (CSP, HSTS, etc.)  
✅ Rate limiting per endpoint  
✅ Input validation & sanitization  

## 🆘 Troubleshooting

### Docker Compose Command
- Modern Docker uses `docker compose` (with space) instead of `docker-compose`
- If you get "docker-compose: command not found", use `docker compose`

### Frontend Shows Blank Screen
- Refresh the browser after both `pnpm dev:backend` and `pnpm dev:frontend` are running; the frontend may need one reload once the API is ready.

### Port Already in Use
```bash
# Check what's using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker compose ps

# Check logs
docker compose logs postgres

# Restart containers
docker compose restart
```

### Permission Issues
```bash
# Make test script executable
chmod +x test-backend.sh
```

## 📝 License

MIT
