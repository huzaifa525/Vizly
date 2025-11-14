# 🐳 Docker Setup Guide - Vizly

Complete guide for running Vizly with Docker Compose.

---

## 📋 Prerequisites

- **Docker** 20.10+ installed
- **Docker Compose** 2.0+ installed
- **Git** for cloning the repository

---

## 🚀 Quick Start

### 1. Clone and Configure

```bash
# Clone repository
git clone https://github.com/huzefanw/vizly.git
cd vizly

# Generate secure credentials
chmod +x setup_env.sh && ./setup_env.sh

# Or manually edit .env file
```

### 2. Development Mode (Hot Reload)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Django Admin: http://localhost:8000/admin

### 3. Production Mode (Optimized)

```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

**Access:**
- Application: http://localhost (port 80)
- Backend API: http://localhost:8000

---

## 🔧 Configuration

### Environment Variables

All configuration is read from `.env` file (root directory):

```bash
# Required
SECRET_KEY=your-secret-key
ENCRYPTION_SALT=your-encryption-salt

# Optional (with defaults)
DEBUG=True
PORT=8000
VITE_PORT=5173
```

**Important**:
- ✅ `.env` file is used automatically by Docker Compose
- ❌ No hardcoded values in docker-compose files
- 🔒 Never commit `.env` to version control

---

## 📁 Docker Compose Files

### `docker-compose.yml` (Development)

**Features:**
- Hot-reload for frontend and backend
- Development server (Django runserver)
- Volume mounts for live code changes
- Debug mode enabled

**Services:**
- `backend` - Django development server
- `frontend` - Vite dev server with HMR

**Usage:**
```bash
docker-compose up -d
```

### `docker-compose.prod.yml` (Production)

**Features:**
- Production-optimized builds
- Gunicorn WSGI server (4 workers)
- Nginx for frontend static files
- Health checks enabled
- No volume mounts (immutable containers)
- Optional services: PostgreSQL, Redis, Celery

**Services:**
- `backend` - Gunicorn + Django
- `frontend` - Nginx + React build
- `postgres` (optional) - PostgreSQL database
- `redis` (optional) - Cache and Celery broker
- `celery-worker` (optional) - Background tasks
- `celery-beat` (optional) - Scheduled tasks

**Usage:**
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 🗄️ Database Options

### Option 1: External Database (Recommended)

Use external PostgreSQL (e.g., AWS RDS, Neon, DigitalOcean):

```bash
# .env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

### Option 2: Docker PostgreSQL

Uncomment PostgreSQL service in `docker-compose.prod.yml`:

```yaml
# Uncomment postgres service section
postgres:
  image: postgres:15-alpine
  # ... rest of config
```

Update `.env`:
```bash
DATABASE_URL=postgresql://vizly:your_password@postgres:5432/vizly
POSTGRES_USER=vizly
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=vizly
```

### Option 3: SQLite (Development Only)

```bash
# .env
DATABASE_URL=sqlite:///db.sqlite3
```

---

## 🔄 Optional Services

### Redis + Celery (Scheduled Queries)

Uncomment in `docker-compose.prod.yml`:

```yaml
# Uncomment these services:
redis:
  # ...
celery-worker:
  # ...
celery-beat:
  # ...
```

Update `.env`:
```bash
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
```

---

## 🛠️ Common Commands

### Development

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Access Django shell
docker-compose exec backend python manage.py shell

# Stop services
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v
```

### Production

```bash
# Build and start
docker-compose -f docker-compose.prod.yml up -d --build

# Force rebuild
docker-compose -f docker-compose.prod.yml build --no-cache

# Scale workers
docker-compose -f docker-compose.prod.yml up -d --scale celery-worker=3

# View resource usage
docker stats

# Update to latest code
git pull
docker-compose -f docker-compose.prod.yml up -d --build

# Backup database (if using Docker PostgreSQL)
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U vizly vizly > backup.sql

# Stop services
docker-compose -f docker-compose.prod.yml down
```

---

## 📊 Monitoring

### Health Checks

```bash
# Check backend health
curl http://localhost:8000/api/

# Check frontend health
curl http://localhost/health

# View service status
docker-compose ps
```

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend

# Since specific time
docker-compose logs --since 2024-01-01T00:00:00 backend
```

### Resource Usage

```bash
# CPU, Memory, Network
docker stats

# Disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

---

## 🔒 Security Best Practices

### Production Deployment

1. **Environment Variables**:
   ```bash
   # Always set in production
   DEBUG=False
   SECRET_KEY=<very-strong-random-key>
   ENCRYPTION_SALT=<unique-salt>
   ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
   ```

2. **HTTPS**:
   - Use reverse proxy (Nginx, Traefik, Caddy)
   - Enable SSL/TLS certificates
   - Set `SECURE_SSL_REDIRECT=True`

3. **Database**:
   - Use external managed database
   - Enable SSL connections
   - Regular backups

4. **Secrets**:
   - Use Docker secrets or environment management
   - Never commit `.env` to git
   - Rotate credentials regularly

---

## 🐛 Troubleshooting

### Issue: "SECRET_KEY not set"

```bash
# Solution: Generate and set in .env
./setup_env.sh

# Or manually
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

### Issue: "Connection refused" between services

```bash
# Solution: Check network connectivity
docker-compose exec backend ping frontend
docker-compose exec frontend ping backend

# Restart services
docker-compose restart
```

### Issue: "Port already in use"

```bash
# Solution: Change port in .env
PORT=8001
VITE_PORT=5174

# Or stop conflicting service
lsof -ti:8000 | xargs kill -9
```

### Issue: Frontend can't connect to backend

```bash
# Development: Update .env
VITE_API_URL=http://localhost:8000/api

# Production: Ensure correct backend URL
VITE_API_URL=https://api.yourdomain.com/api
```

### Issue: Database migration errors

```bash
# Reset database (WARNING: deletes data)
docker-compose down -v
docker-compose up -d
docker-compose exec backend python manage.py migrate

# Or manually run migrations
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
```

---

## 📈 Performance Optimization

### Production Settings

```yaml
# docker-compose.prod.yml
backend:
  command: gunicorn vizly.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 4 \              # CPU cores * 2 + 1
    --worker-class gevent \    # Async workers
    --worker-connections 1000 \
    --timeout 300 \
    --max-requests 1000 \      # Restart workers after N requests
    --max-requests-jitter 100
```

### Resource Limits

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [Nginx Configuration](https://nginx.org/en/docs/)

---

## 🆘 Support

For issues or questions:
- 📧 Email: huzaifanalkhedaemp@gmail.com
- 💬 GitHub Issues: https://github.com/huzefanw/vizly/issues
- 📖 Documentation: See other `.md` files in repository

---

**Built with ❤️ by [Huzefa Nalkheda Wala](https://huzefanw.dev)**
