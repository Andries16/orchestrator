FROM node:22-alpine

WORKDIR /app

# Copy root package.json and workspace configuration
COPY package*.json ./

# Copy package.json for workspaces to install dependencies
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set working directory to frontend
WORKDIR /app/apps/frontend

# Expose frontend port
EXPOSE 3000

# Start frontend dev server
CMD ["npm", "run", "dev"]
