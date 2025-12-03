# Vizly Architecture

## Overview
Vizly is a lightweight, self-hosted business intelligence tool built with modern web technologies

## Technology Stack

### Backend
- **Framework**: Django 5.0+
- **API**: Django REST Framework
- **Language**: Python 3.10+
- **ORM**: Django ORM
- **Authentication**: SimpleJWT (JWT tokens)
- **Internal Database**: SQLite (production can use PostgreSQL)
- **Database Drivers**:
  - PostgreSQL (psycopg2)
  - MySQL (mysqlclient)
  - SQLite (built-in)
- **Query Engine**: SQLAlchemy for external database connections
- **Data Processing**: pandas for advanced analytics

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
- **Environment Management**: python-decouple
- **WSGI Server**: Gunicorn (production)

## Project Structure

```
vizly/
├── backend/                 # Django backend
│   ├── vizly/              # Main project settings
│   │   ├── settings.py     # Django settings
│   │   ├── urls.py         # Main URL config
│   │   └── wsgi.py         # WSGI entry point
│   ├── api/                # User authentication app
│   │   ├── models.py       # User model
│   │   ├── serializers.py  # User serializers
│   │   ├── views.py        # Auth views
│   │   └── urls.py         # Auth URLs
│   ├── connections/        # Database connections app
│   │   ├── models.py       # Connection model
│   │   ├── serializers.py  # Connection serializers
│   │   ├── views.py        # Connection views
│   │   ├── services.py     # Database services
│   │   └── urls.py         # Connection URLs
│   ├── queries/            # SQL queries app
│   ├── visualizations/     # Charts app
│   ├── dashboards/         # Dashboards app
│   ├── manage.py           # Django management
│   └── requirements.txt    # Python dependencies
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── stores/        # Zustand stores
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
