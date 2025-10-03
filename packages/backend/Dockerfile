FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY packages/backend/package.json ./packages/backend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/backend ./packages/backend

# Build the application
WORKDIR /app/packages/backend
RUN pnpm build

# Expose port
EXPOSE 3001

# Start the application
CMD ["sh", "-c", "pnpm migration:run && pnpm seed:run && pnpm start:prod"]