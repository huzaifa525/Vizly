# Vizly Architecture

## Overview
Vizly is a lightweight, self-hosted business intelligence tool built with modern web technologies.

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Internal Database**: SQLite (production can use PostgreSQL)
- **API**: RESTful API
- **Database Drivers**:
  - PostgreSQL (pg)
  - MySQL (mysql2)
  - SQLite (better-sqlite3)

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **State Management**: React Context API / Zustand
- **HTTP Client**: Axios
- **Router**: React Router v6

### DevOps
- **Containerization**: Docker + Docker Compose
- **Environment Management**: dotenv
- **Process Manager**: PM2 (optional)

## Project Structure

```
vizly/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Prisma models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── index.ts        # Entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   ├── types/         # TypeScript types
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml      # Docker setup
├── Dockerfile              # Docker image
└── README.md               # Documentation
```

## Core Features Implementation

### 1. Database Connections
- Support multiple database connections
- Store connection configs in internal database
- Test connections before saving
- Secure credential storage

### 2. Query Management
- SQL editor with syntax highlighting
- Query builder (optional)
- Save and organize queries
- Query history tracking

### 3. Visualizations
- Auto-detect data types
- Generate appropriate chart types
- Interactive charts with Recharts
- Export charts as images

### 4. Dashboards
- Drag-and-drop dashboard builder
- Real-time data refresh
- Shareable dashboard links
- Dashboard templating

## Security Considerations
- SQL injection prevention
- Connection string encryption
- Rate limiting
- Authentication & Authorization (JWT)
- CORS configuration

## Scalability
- Stateless API design
- Horizontal scaling ready
- Database connection pooling
- Caching strategy (Redis optional)
