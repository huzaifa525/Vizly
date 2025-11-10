# Vizly Setup Guide

This guide will help you set up Vizly for local development or production deployment.

## Table of Contents
- [Local Development Setup](#local-development-setup)
- [Production Deployment](#production-deployment)
- [Database Configuration](#database-configuration)
- [Troubleshooting](#troubleshooting)

## Local Development Setup

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git

### Step-by-Step Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vizly
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install all workspace dependencies
   npm run install:all
   ```

3. **Configure Backend**
   ```bash
   cd backend
   cp .env.example .env
   ```

   Edit `backend/.env` and update:
   - `JWT_SECRET`: Use a secure random string
   - `DATABASE_URL`: Path to SQLite database (default is fine for dev)

4. **Initialize Database**
   ```bash
   # From the backend directory
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Start Development Servers**

   Option 1 - Run both servers with one command (from root):
   ```bash
   npm run dev
   ```

   Option 2 - Run servers separately:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - API Health Check: http://localhost:3001/health

## Production Deployment

### Using Docker (Recommended)

1. **Create environment file**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set:
   ```env
   JWT_SECRET=your-production-secret-key
   ```

2. **Build and start containers**
   ```bash
   docker-compose up -d
   ```

3. **Check logs**
   ```bash
   docker-compose logs -f
   ```

4. **Access the application**
   Open http://localhost:3001

### Manual Production Setup

1. **Build Backend**
   ```bash
   cd backend
   npm ci --only=production
   npm run build
   npm run prisma:generate
   npm run prisma:migrate
   ```

2. **Build Frontend**
   ```bash
   cd frontend
   npm ci --only=production
   npm run build
   ```

3. **Configure Production Environment**
   Create `backend/.env`:
   ```env
   NODE_ENV=production
   PORT=3001
   DATABASE_URL="file:./vizly.db"
   JWT_SECRET=your-production-secret-key
   CORS_ORIGIN=http://your-domain.com
   ```

4. **Start the Backend Server**
   ```bash
   cd backend
   npm start
   ```

5. **Serve Frontend**
   Serve the `frontend/dist` directory using a web server (nginx, Apache, etc.)
   or configure Express to serve static files from the frontend build.

## Database Configuration

### SQLite (Default)
SQLite is used by default for the internal Vizly database. No additional setup needed.

```env
DATABASE_URL="file:./vizly.db"
```

### PostgreSQL (Alternative)

1. **Update docker-compose.yml**
   Uncomment the PostgreSQL service

2. **Update DATABASE_URL**
   ```env
   DATABASE_URL="postgresql://vizly:vizly@postgres:5432/vizly"
   ```

3. **Update Prisma schema**
   In `backend/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

4. **Regenerate Prisma client and migrate**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

## Connecting to External Databases

Vizly supports connecting to:
- PostgreSQL
- MySQL
- SQLite

To connect to an external database:

1. Log into Vizly
2. Navigate to "Connections"
3. Click "Add Connection"
4. Fill in connection details:
   - Name: Friendly name for the connection
   - Type: Database type (PostgreSQL/MySQL/SQLite)
   - Host: Database server hostname
   - Port: Database port (5432 for PostgreSQL, 3306 for MySQL)
   - Database: Database name
   - Username: Database user
   - Password: Database password
   - SSL: Enable if required

5. Click "Test Connection" to verify
6. Click "Save" to store the connection

## Troubleshooting

### Backend won't start
- Check that port 3001 is available
- Verify DATABASE_URL in .env
- Run `npm run prisma:generate` to ensure Prisma client is generated
- Check logs for specific error messages

### Frontend won't connect to backend
- Verify backend is running on port 3001
- Check CORS_ORIGIN in backend .env matches frontend URL
- Check browser console for CORS errors

### Database connection errors
- Verify external database is accessible from Vizly server
- Check firewall rules
- Verify credentials are correct
- Test connection using database client

### Docker issues
- Ensure Docker and Docker Compose are installed
- Check if ports 3001 is available
- Run `docker-compose logs` to see error messages
- Try rebuilding: `docker-compose build --no-cache`

### Migration errors
- Delete `backend/prisma/migrations` folder and `vizly.db` file
- Run `npm run prisma:migrate` again
- Check Prisma schema for syntax errors

## Security Best Practices

1. **JWT Secret**: Use a strong, random secret key
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Database Passwords**: Never commit real passwords to version control

3. **CORS**: Set CORS_ORIGIN to your actual frontend domain in production

4. **SSL**: Enable SSL for database connections when possible

5. **Firewall**: Only expose necessary ports (3001) to the internet

6. **Updates**: Keep dependencies up to date
   ```bash
   npm audit
   npm update
   ```

## Next Steps

After setup:
1. Register your first user account
2. Add a database connection
3. Create your first query
4. Build a visualization
5. Create a dashboard

For more information, see the main [README.md](README.md).
