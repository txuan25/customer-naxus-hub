-- Create database and extensions
CREATE DATABASE cnh_db;

\c cnh_db;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'cso');
CREATE TYPE customer_status AS ENUM ('active', 'inactive', 'prospect');
CREATE TYPE inquiry_status AS ENUM ('open', 'in_progress', 'pending_approval', 'approved', 'rejected', 'closed');
CREATE TYPE inquiry_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE response_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected', 'sent');

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE cnh_db TO cnh_user;
GRANT ALL ON SCHEMA public TO cnh_user;