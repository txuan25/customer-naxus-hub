# Database Migration Guide

## 🎯 Overview

This guide explains how to manage database schema for both development and production environments.

## 📊 Development vs Production Workflows

### Development Environment (Quick Setup)

```bash
# TypeORM automatically creates tables from entities (synchronize: true)
cd customer-nexus-hub
docker compose up -d
pnpm run dev:backend
pnpm run seed  # Optional: Add test data
```

### Production Environment (Migration-based)

```bash
# Use migrations for controlled schema changes (synchronize: false)
cd customer-nexus-hub
docker compose up -d
cd packages/backend
NODE_ENV=production pnpm run migration:run
NODE_ENV=production pnpm run start:prod
```

## 📁 Migration Files

### Created Migration Files:
- `src/migrations/1701000000000-InitialMigration.ts` - Creates all tables with indexes and foreign keys
- `src/config/typeorm.config.ts` - TypeORM CLI configuration

## 🛠️ Migration Commands

### View Migration Status
```bash
pnpm run migration:show
```

### Run Migrations (Create Tables)
```bash
pnpm run migration:run
```

### Rollback Last Migration
```bash
pnpm run migration:revert
```

### Generate New Migration (After Entity Changes)
```bash
# After modifying an entity
pnpm run migration:generate -- src/migrations/AddNewField
```

### Create Empty Migration
```bash
pnpm run migration:create -- src/migrations/CustomMigration
```

## 🔄 Workflow Examples

### 1. Fresh Development Setup
```bash
# Start services
docker compose up -d

# Option A: Use synchronize (automatic)
pnpm run dev:backend  # Tables auto-created

# Option B: Use migrations (production-like)
pnpm run migration:run
pnpm run dev:backend
```

### 2. Production Deployment
```bash
# Build application
pnpm run build

# Run migrations (NEVER use synchronize:true)
NODE_ENV=production pnpm run migration:run

# Start server
NODE_ENV=production pnpm run start:prod
```

### 3. Adding New Column to Existing Table
```bash
# 1. Modify entity file (e.g., add new field to User entity)

# 2. Generate migration
pnpm run migration:generate -- src/migrations/AddPhoneToUser

# 3. Review generated migration file

# 4. Run migration
pnpm run migration:run
```

## ⚠️ Important Notes

### Development
- `synchronize: true` - Tables auto-created/updated from entities
- Fast iteration, no migration files needed
- ⚠️ Data loss possible when entities change
- Perfect for local development

### Production
- `synchronize: false` - MUST use migrations
- Controlled, versioned schema changes
- Can rollback if needed
- Safe for production data

## 📊 Configuration

### Current Setup in `database.config.ts`:
```typescript
synchronize: process.env.NODE_ENV === 'development'
// true for dev, false for production
```

### Migration Config in `typeorm.config.ts`:
- Entities: `src/entities/**/*.entity.ts`
- Migrations: `src/migrations/**/*.ts`
- CLI ready for migration commands

## 🚀 Quick Reference

| Environment | Tables Created By | Seed Data | Safe for Production |
|-------------|------------------|-----------|-------------------|
| Development | `synchronize: true` OR migrations | ✅ Yes | ❌ No |
| Production | Migrations ONLY | ❌ No | ✅ Yes |

## 📝 Migration Best Practices

1. **Always review generated migrations** before running
2. **Test migrations** on staging before production
3. **Keep migrations small** and focused
4. **Name migrations clearly** (e.g., AddEmailIndexToUsers)
5. **Never edit** migrations after they've run in production
6. **Backup database** before running migrations in production

## 🔧 Troubleshooting

### Migration fails to run
```bash
# Check database connection
docker ps  # Ensure PostgreSQL is running

# Check .env file
cat packages/backend/.env

# Try with verbose logging
NODE_ENV=development pnpm run migration:run
```

### Tables already exist error
```bash
# If switching from synchronize to migrations
# Option 1: Drop and recreate (DEV ONLY!)
docker compose down -v
docker compose up -d
pnpm run migration:run

# Option 2: Mark migration as executed
# Manually insert into migrations table
```

## 📋 Checklist for Production Deployment

- [ ] Set `NODE_ENV=production`
- [ ] Ensure `synchronize: false` in production
- [ ] Run migrations before starting app
- [ ] Do NOT run seed data
- [ ] Backup database before migrations
- [ ] Test migrations on staging first