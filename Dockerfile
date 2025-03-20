# Base Image for Build Stage
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Install dependencies only in the development stage
FROM base AS development
RUN npm install
COPY . .

# Build Stage
FROM base AS builder 
RUN npm install
COPY . .
RUN npm run build

# Base image for Runtime Stage
FROM node:20-alpine AS production

# Working Directory
WORKDIR /app

# Copy only essential files from Builder Stage
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/public /app/public

# Install production dependencies
RUN npm ci --only=production

# Run the project
CMD ["npm", "start"]