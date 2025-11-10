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

## Tech Stack

### Backend
- Node.js + TypeScript
- Express.js
- Prisma ORM
- SQLite (internal database)
- JWT authentication

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Recharts
- Zustand (state management)

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
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
npm install
cp .env.example .env
# Edit .env with your configuration
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Docker Deployment

```bash
docker-compose up -d
```

## Project Structure

```
vizly/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── index.ts        # Entry point
│   └── prisma/
│       └── schema.prisma   # Database schema
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── stores/        # Zustand stores
│   │   └── types/         # TypeScript types
│   └── public/
│
└── docker-compose.yml      # Docker setup
```

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Connections
- `POST /api/connections` - Create database connection
- `GET /api/connections` - List all connections
- `GET /api/connections/:id` - Get connection details
- `PUT /api/connections/:id` - Update connection
- `DELETE /api/connections/:id` - Delete connection
- `POST /api/connections/:id/test` - Test connection

### Queries
- `POST /api/queries` - Create query
- `GET /api/queries` - List all queries
- `GET /api/queries/:id` - Get query details
- `PUT /api/queries/:id` - Update query
- `DELETE /api/queries/:id` - Delete query
- `POST /api/queries/:id/execute` - Execute query

### Visualizations
- `POST /api/visualizations` - Create visualization
- `GET /api/visualizations` - List all visualizations
- `GET /api/visualizations/:id` - Get visualization
- `PUT /api/visualizations/:id` - Update visualization
- `DELETE /api/visualizations/:id` - Delete visualization

### Dashboards
- `POST /api/dashboards` - Create dashboard
- `GET /api/dashboards` - List all dashboards
- `GET /api/dashboards/:id` - Get dashboard
- `PUT /api/dashboards/:id` - Update dashboard
- `DELETE /api/dashboards/:id` - Delete dashboard

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=3001
NODE_ENV=development
DATABASE_URL="file:./vizly.db"
JWT_SECRET=your-secret-key-change-this-in-production
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- CORS protection
- Helmet.js for security headers
- Rate limiting
- SQL injection prevention via parameterized queries

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

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
- [ ] API rate limiting per user
- [ ] Query performance metrics

## Support

For issues, questions, or contributions, please open an issue on GitHub.
