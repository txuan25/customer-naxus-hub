-- Create the database
CREATE DATABASE customer_nexus_hub;

-- Create user
CREATE USER crm_user WITH PASSWORD 'crmpass123';

-- Grant all privileges on database
GRANT ALL PRIVILEGES ON DATABASE customer_nexus_hub TO crm_user;

-- Connect to the database
\c customer_nexus_hub;

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO crm_user;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure crm_user can create tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO crm_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO crm_user;