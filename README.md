# Vizly

A lightweight, self-hosted business intelligence tool inspired by Metabase. Vizly connects seamlessly to your existing databases while maintaining its own internal database for configurations and queries.

## Features

- **Multiple Database Support**: Connect to PostgreSQL, MySQL, and SQLite databases
- **SQL Query Editor**: Write and execute SQL queries with ease
- **Data Visualization**: Auto-generate charts and visualizations from query results
- **Dashboard Builder**: Create and share interactive dashboards
- **User Management**: Built-in authentication and authorization
- **Self-Hosted**: Full control over your data and infrastructure
- **Minimal Setup**: Easy to deploy with Docker
- **Python-Powered**: Leverage Python's data ecosystem for analytics

## Tech Stack

### Backend
- Django 5.0 + Python 3.10+
- Django REST Framework
- SimpleJWT (JWT authentication)
- Django ORM + SQLAlchemy
- pandas for data processing

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Recharts
- Zustand (state management)

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+ (for frontend)
- pip
- Docker (optional, for containerized deployment)

### Local Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd vizly
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

3. **Frontend Setup** (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Django Admin: http://localhost:8000/admin

### Docker Deployment

```bash
docker-compose up -d
```

## Project Structure

```
vizly/
├── backend/                 # Django backend
│   ├── vizly/              # Main project settings
│   ├── api/                # User authentication app
│   ├── connections/        # Database connections app
│   ├── queries/            # SQL queries app
│   ├── visualizations/     # Charts app
│   ├── dashboards/         # Dashboards app
│   └── manage.py           # Django management
│
└── frontend/               # React frontend
    ├── src/
    │   ├── components/    # React components
    │   ├── pages/         # Page components
    │   ├── services/      # API services
    │   └── stores/        # Zustand stores
    └── package.json
```

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Connections
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
- `POST /api/queries/{id}/execute/` - Execute query

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
- `PUT /api/dashboards/{id}/` - Update dashboard
- `DELETE /api/dashboards/{id}/` - Delete dashboard

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
SECRET_KEY=your-secret-key-change-this-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## Why Django?

Vizly uses Django because it's ideal for data-intensive applications:

- **Python Ecosystem**: Access to pandas, numpy, and other data science libraries
- **Mature ORM**: Battle-tested database abstraction with migrations
- **Built-in Admin**: Instant admin interface for data management
- **Security**: CSRF, XSS, SQL injection protection out-of-the-box
- **Scalability**: Production-proven for data-heavy applications

## Security

- Passwords are hashed using Django's default Argon2 hasher
- JWT tokens for authentication
- CORS protection
- Django security middleware enabled
- SQL injection prevention via ORM and parameterized queries

## Development

### Running Tests
```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Backend
cd backend
pip install -r requirements.txt
python manage.py collectstatic
python manage.py migrate

# Frontend
cd frontend
npm run build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see LICENSE file for details

## Roadmap

- [ ] Query builder UI
- [ ] More chart types
- [ ] Advanced dashboard layouts
- [ ] Scheduled queries
- [ ] Email alerts
- [ ] CSV/Excel export
- [ ] Database schema explorer
- [ ] Multi-user collaboration
- [ ] Query performance metrics
- [ ] Data caching layer

## Support

For issues, questions, or contributions, please open an issue on GitHub.
