# Stage 1: Build the Next.js frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build  # Builds to .next/

# Stage 2: Build the Express backend
FROM node:20-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
# If using TypeScript, compile if needed (e.g., if package.json has a build script)
RUN npm run build  # Assumes "build": "tsc" or similar; skip if server.ts runs directly

# Stage 3: Serve with Nginx
FROM nginx:alpine
# Install Node.js to run both servers
RUN apk add --no-cache nodejs npm
# Copy built Next.js app
COPY --from=frontend-build /app/frontend /app/frontend
# Copy built backend
COPY --from=backend-build /app/backend /app/backend
# Copy custom Nginx config
COPY nginx.conf /etc/nginx/nginx.conf
# Expose port 80
EXPOSE 80
# Start both servers and Nginx
CMD ["sh", "-c", "cd /app/frontend && npm start & cd /app/backend && npm start & nginx -g 'daemon off;'"]