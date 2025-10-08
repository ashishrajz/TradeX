# Use lightweight Node.js image
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .
COPY .env.docker .env.local

# Build Next.js app
RUN npm run build

# Final runtime image
FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app ./
EXPOSE 3000

ENV NODE_ENV=production
CMD ["npm", "run", "start"]
