# Vizly

A modern, self-hosted business intelligence platform with a beautiful corporate UI. Connect to your databases, write SQL queries, create stunning visualizations, and build interactive dashboards—all with enterprise-grade security and performance.

## ✨ Key Features

### Data & Connectivity
- **Multiple Database Support**: Connect to PostgreSQL, MySQL, and SQLite databases
- **Encrypted Credentials**: Database passwords encrypted using Fernet encryption
- **Connection Testing**: Verify database connectivity before saving
- **SQL Query Editor**: Professional syntax-highlighted SQL editor powered by CodeMirror
- **Live Query Execution**: Run queries and see results instantly with intelligent caching

### Visualizations & Dashboards
- **20+ Chart Types**: Line, Bar, Pie, Area, Scatter, Bubble, Heatmap, Treemap, Sunburst, Sankey, Funnel, Radar, Gauge, Candlestick, Box Plot, Waterfall, and more
- **Drag & Drop Dashboards**: Fully customizable grid-based dashboard layouts with resize and reposition
- **Real-time Updates**: Refresh individual visualizations without reloading the entire dashboard
- **Responsive Design**: Beautiful on desktop, tablet, and mobile devices

### Modern User Experience
- **Corporate Design System**: Professional indigo-based brand colors with smooth animations
- **Dark Mode**: Full dark mode support with theme persistence
- **Form Validation**: Real-time validation with helpful error messages
- **Command Palette**: Quick navigation with ⌘K / Ctrl+K keyboard shortcut
- **Loading States**: Elegant skeleton loaders instead of spinners
- **Toast Notifications**: Beautiful, non-intrusive notifications for all actions
- **Built-in Documentation**: Comprehensive in-app documentation for all features

### Security & Performance
- **Rate Limiting**: Protection against brute force attacks on all critical endpoints
- **Comprehensive Logging**: Structured logging with rotating file handlers for audit trails
- **JWT Authentication**: Secure token-based authentication
- **Data Caching**: Intelligent caching with React Query reduces API calls by 70%
- **CORS Protection**: Configurable CORS origins for secure cross-origin requests
- **SQL Injection Prevention**: Parameterized queries via SQLAlchemy

## 🛠 Tech Stack

### Backend
- **Django 5.0.1** + Python 3.10+
- **Django REST Framework** - RESTful API design
- **SimpleJWT** - JWT token authentication
- **SQLAlchemy** - Database query execution engine
- **django-ratelimit** - API rate limiting and throttling
- **cryptography** - Fernet encryption for credentials
- **pandas** - Data processing and transformation

### Frontend
- **React 18** + **TypeScript 5.6** + **Vite 5.4**
- **TanStack React Query v5** - Data fetching, caching, and synchronization
- **React Hook Form** + **Zod** - Form validation and schema validation
- **Tailwind CSS** - Custom design system with indigo brand colors
- **Nivo Charts** - 20+ interactive chart types
- **CodeMirror** - SQL syntax highlighting
- **Framer Motion** - Smooth animations and transitions
- **Sonner** - Beautiful toast notifications
- **Zustand** - Lightweight state management
- **React Grid Layout** - Drag-and-drop dashboard layouts

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- pip
- Docker (optional, for containerized deployment)

### Local Development

**1. Clone the repository**
```bash
git clone <repository-url>
cd vizly
```

**2. Backend Setup**
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Create logs directory
mkdir logs

# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Start backend server
python manage.py runserver
```

**3. Frontend Setup** (in a new terminal)
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin
- **Built-in Docs**: http://localhost:5173/docs (after login)

### Docker Deployment

**Development Mode** (with hot-reload):
```bash
docker-compose up -d
```

This starts both backend and frontend services:
- Frontend: http://localhost:5173 (Vite dev server with hot-reload)
- Backend: http://localhost:8000 (Django API)
- Django Admin: http://localhost:8000/admin

**Production Mode** (optimized build):
```bash
docker-compose -f docker-compose.prod.yml up -d
```

This builds and serves the optimized production bundle.

## 📁 Project Structure

```
vizly/
├── backend/                    # Django backend
│   ├── vizly/                 # Project settings
│   │   ├── settings.py        # Django config, logging setup
│   │   └── urls.py            # URL routing
│   ├── api/                   # User authentication
│   │   ├── views.py           # Login, register (with rate limiting)
│   │   └── serializers.py     # User serializers
│   ├── connections/           # Database connections
│   │   ├── models.py          # Connection model with encryption
│   │   ├── encryption.py      # Fernet encryption utilities
│   │   └── services.py        # Query execution engine
│   ├── queries/               # SQL queries
│   │   ├── views.py           # Query CRUD, execute, execute_raw
│   │   └── models.py          # Query model
│   ├── visualizations/        # Charts & visualizations
│   │   ├── views.py           # Visualization CRUD
│   │   └── models.py          # Visualization model
│   ├── dashboards/            # Dashboard management
│   │   ├── views.py           # Dashboard CRUD
│   │   └── models.py          # Dashboard model with layout
│   ├── logs/                  # Application logs (auto-generated)
│   │   ├── vizly.log          # General application logs
│   │   ├── queries.log        # Query execution logs
│   │   └── errors.log         # Error-specific logs
│   └── manage.py              # Django management
│
└── frontend/                  # React frontend
    ├── src/
    │   ├── components/
    │   │   ├── ui/            # Reusable UI components
    │   │   │   ├── Button.tsx        # Button with variants
    │   │   │   ├── Card.tsx          # Card layouts
    │   │   │   ├── Badge.tsx         # Status badges
    │   │   │   ├── Input.tsx         # Form inputs
    │   │   │   ├── EmptyState.tsx    # Empty state screens
    │   │   │   └── Skeleton.tsx      # Loading skeletons
    │   │   ├── Sidebar.tsx           # Navigation sidebar
    │   │   ├── CommandPalette.tsx    # ⌘K quick nav
    │   │   ├── ChartRenderer.tsx     # Chart display logic
    │   │   └── Layout.tsx            # Main layout wrapper
    │   ├── pages/
    │   │   ├── DashboardPage.tsx        # Dashboard list
    │   │   ├── DashboardViewPage.tsx    # Dashboard view/edit
    │   │   ├── ConnectionsPage.tsx      # DB connections
    │   │   ├── QueriesPage.tsx          # SQL editor
    │   │   ├── VisualizationsPage.tsx   # Chart builder
    │   │   ├── DocsPage.tsx             # Documentation
    │   │   ├── LoginPage.tsx            # Login
    │   │   └── RegisterPage.tsx         # Registration
    │   ├── services/          # API client services
    │   ├── stores/            # Zustand state stores
    │   ├── lib/               # Utility functions
    │   └── types/             # TypeScript types
    └── package.json
```

## 📡 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user (rate limit: 5/hour per IP)
- `POST /api/auth/login` - Login user (rate limit: 10/minute per IP)
- `GET /api/auth/me` - Get current user

### Database Connections
- `POST /api/connections/` - Create database connection
- `GET /api/connections/` - List all connections
- `GET /api/connections/{id}/` - Get connection details
- `PUT /api/connections/{id}/` - Update connection
- `DELETE /api/connections/{id}/` - Delete connection
- `POST /api/connections/{id}/test/` - Test connection

### Queries
- `POST /api/queries/` - Create query
- `GET /api/queries/` - List all queries
- `GET /api/queries/{id}/` - Get query details
- `PUT /api/queries/{id}/` - Update query
- `DELETE /api/queries/{id}/` - Delete query
- `POST /api/queries/{id}/execute/` - Execute saved query (rate limit: 30/minute per user)
- `POST /api/queries/execute_raw/` - Execute raw SQL without saving (rate limit: 30/minute per user)

### Visualizations
- `POST /api/visualizations/` - Create visualization
- `GET /api/visualizations/` - List all visualizations
- `GET /api/visualizations/{id}/` - Get visualization
- `PUT /api/visualizations/{id}/` - Update visualization
- `DELETE /api/visualizations/{id}/` - Delete visualization

### Dashboards
- `POST /api/dashboards/` - Create dashboard
- `GET /api/dashboards/` - List all dashboards
- `GET /api/dashboards/{id}/` - Get dashboard
- `PUT /api/dashboards/{id}/` - Update dashboard (includes layout)
- `DELETE /api/dashboards/{id}/` - Delete dashboard

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
SECRET_KEY=your-secret-key-change-this-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Logging Configuration

Vizly maintains structured logs in the `backend/logs/` directory:

- **`vizly.log`** - General application logs (INFO level and above)
- **`queries.log`** - Query execution logs with performance metrics
- **`errors.log`** - Error-specific logs (ERROR level and above)

All logs use rotating file handlers:
- Max file size: 10MB
- Backup count: 5 files
- Format: `[timestamp] [level] [logger] message`

Example log entry:
```
[2025-01-12 15:30:45,123] [INFO] [queries] User 1 executing query 5 on connection prod_db
[2025-01-12 15:30:45,890] [INFO] [queries] Query 5 executed successfully, returned 1250 rows
```

## 🔒 Security

Vizly implements multiple layers of security:

### Credential Protection
- **Database Password Encryption**: All database credentials encrypted using Fernet (symmetric encryption) before storage
- **JWT Tokens**: Secure token-based authentication with refresh tokens
- **Password Hashing**: User passwords hashed using Django's Argon2 hasher

### Rate Limiting
Protects against brute force and DoS attacks:
- **Login**: 10 attempts/minute per IP address
- **Registration**: 5 attempts/hour per IP address
- **Query Execution**: 30 requests/minute per authenticated user

### Additional Security Features
- **CORS Protection**: Configurable allowed origins
- **CSRF Protection**: Django CSRF middleware enabled
- **XSS Prevention**: React's built-in XSS protection + Django sanitization
- **SQL Injection Prevention**: All queries executed via SQLAlchemy with parameterization
- **Security Headers**: Django security middleware enabled (X-Frame-Options, etc.)
- **Audit Logging**: All authentication attempts and query executions logged

### Best Practices
- Use read-only database users when possible
- Enable SSL/TLS for database connections in production
- Regularly rotate SECRET_KEY and JWT secrets
- Set dashboards to Private unless sharing is required
- Monitor logs for suspicious activity

## 🎯 Why Django?

Vizly uses Django because it's ideal for data-intensive applications:

- **Python Ecosystem**: Direct access to pandas, numpy, and data science libraries
- **Mature ORM**: Battle-tested database abstraction with automatic migrations
- **Built-in Admin**: Instant admin interface for data management and debugging
- **Security First**: CSRF, XSS, SQL injection protection out-of-the-box
- **Scalability**: Production-proven for data-heavy applications (Instagram, Spotify, etc.)
- **Rich Middleware**: Easy integration of logging, rate limiting, and monitoring

## 🧪 Development

### Running Tests
```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend
npm test
```

*Note: Comprehensive test coverage is planned for future releases.*

### Building for Production
```bash
# Backend
cd backend
pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate

# Frontend
cd frontend
npm run build
# Build output will be in frontend/dist/
```

### Code Quality
```bash
# Backend linting
cd backend
flake8 .
black . --check

# Frontend linting
cd frontend
npm run lint
```

## 🗺 Roadmap

### ✅ Completed
- [x] Multiple database support (PostgreSQL, MySQL, SQLite)
- [x] 20+ chart types with Nivo integration
- [x] Advanced drag-and-drop dashboard layouts
- [x] Modern corporate UI with dark mode
- [x] Built-in documentation page
- [x] Rate limiting and security hardening
- [x] Credential encryption
- [x] Comprehensive logging system
- [x] SQL syntax highlighting
- [x] Form validation with Zod
- [x] Data caching with React Query

### 🚧 In Progress
- [ ] Query builder UI (visual query constructor)
- [ ] Scheduled queries (cron-based execution)
- [ ] Email alerts (notifications on data changes)
- [ ] CSV/Excel export (download query results)
- [ ] Database schema explorer (visual DB structure)

### 📋 Planned
- [ ] Multi-user collaboration (sharing & permissions)
- [ ] Query performance metrics (execution time tracking)
- [ ] Query result caching (Redis integration)
- [ ] Version control for queries (query history & rollback)
- [ ] API documentation page (Swagger/OpenAPI)
- [ ] Webhook integrations (trigger external services)
- [ ] Custom chart themes (branded visualizations)
- [ ] Mobile app (iOS & Android)
- [ ] SQL autocomplete (intelligent suggestions)
- [ ] Query optimization hints (performance recommendations)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 💬 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check the built-in documentation at `/docs` (after login)
- Review the API documentation above

## 🙏 Acknowledgments

- Built with Django and React
- Charts powered by Nivo
- UI inspired by modern corporate design systems
- Icons by Lucide

---

**Made with ❤️ for data-driven teams**
