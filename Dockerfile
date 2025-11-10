# Multi-stage build for Vizly with Django

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Production image
FROM python:3.11-slim AS production
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    pkg-config \
    postgresql-client \
    libpq-dev \
    default-libmysqlclient-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt backend/requirements-prod.txt ./
RUN pip install --no-cache-dir -r requirements-prod.txt

# Copy backend code
COPY backend/ ./

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist ./staticfiles/frontend

# Create directory for SQLite database
RUN mkdir -p /app/data

# Collect static files
RUN python manage.py collectstatic --noinput || true

# Expose port
EXPOSE 8000

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=vizly.settings

# Run migrations and start server
CMD ["sh", "-c", "python manage.py migrate && gunicorn vizly.wsgi:application --bind 0.0.0.0:8000 --workers 3"]
