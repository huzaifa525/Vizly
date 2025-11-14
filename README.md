<div align="center">

# 📊 Vizly

### *Production-Ready Business Intelligence Platform*

[![Stars](https://img.shields.io/github/stars/huzaifa525/vizly?style=social)](https://github.com/huzaifa525/vizly)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Django](https://img.shields.io/badge/Django-5.0-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-yellow.svg)](https://www.python.org/)

**Self-hosted • Enterprise-Grade • Security-First • Open Source**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Security](#-security) • [Demo](#-demo)

---

<img src="https://via.placeholder.com/800x400/0066cc/ffffff?text=Vizly+Dashboard+Preview" alt="Vizly Dashboard" width="800"/>

*Transform your data into actionable insights with enterprise-grade security*

</div>

---

## 🌟 Overview

**Vizly** is a production-ready, self-hosted Business Intelligence platform that combines the power of modern web technologies with enterprise-grade security. Built by [**Huzefa Nalkheda Wala**](https://huzaifa525.dev), AI Product Engineer at CleverFlow, Vizly brings professional BI capabilities to teams who want complete control over their data.

### Why Vizly?

- 🔒 **Security-First**: Built from the ground up with production security in mind
- 🚀 **Performance**: Handles 20K+ queries with sub-millisecond response times
- 🎨 **Modern UI**: Beautiful, responsive interface built with React + TypeScript
- 🔧 **Enterprise Features**: RBAC, activity logging, scheduled queries, and more
- 📊 **22+ Chart Types**: From basic bar charts to advanced Sankey diagrams
- 🌍 **Multi-Database**: PostgreSQL, MySQL, SQLite support out of the box

---

## ✨ Features

### 🎯 Core Capabilities

<table>
<tr>
<td width="50%">

#### **Data Connectivity**
- 🗄️ Multi-database support (PostgreSQL, MySQL, SQLite)
- 🔐 Encrypted credential storage (AES-256)
- 🔄 Connection pooling for performance
- ⚡ Real-time connection testing
- 📋 Schema explorer with metadata

</td>
<td width="50%">

#### **Query Management**
- 📝 Advanced SQL editor with syntax highlighting
- 💾 Save and organize queries
- 🚀 Execute with timeout protection
- 📥 Export to CSV, Excel, JSON
- 🔍 Query performance tracking

</td>
</tr>
<tr>
<td>

#### **Visualizations**
- 📊 22+ chart types (Line, Bar, Pie, Sankey, etc.)
- 🎨 Interactive dashboards with drag-and-drop
- 📐 React Grid Layout for flexibility
- 🔄 Real-time data refresh
- 🎯 Custom configuration per chart

</td>
<td>

#### **Security & Compliance**
- 🔐 JWT authentication with 15-min tokens
- 🛡️ Role-Based Access Control (RBAC)
- 📝 Comprehensive activity logging
- 🔒 SQL injection prevention
- 🚫 Rate limiting (100/hr anonymous, 10K/hr authenticated)

</td>
</tr>
</table>

### 🎓 Enterprise Features

| Feature | Description | Status |
|---------|-------------|--------|
| **RBAC System** | Admin, Analyst, Viewer roles with granular permissions | ✅ Production |
| **Activity Logging** | Track all user actions with IP and user agent | ✅ Production |
| **Query Validation** | Prevent dangerous SQL operations for non-admins | ✅ Production |
| **Scheduled Queries** | Cron-based automation with email notifications | ✅ Production |
| **Performance Monitoring** | Track query execution times and slow queries | ✅ Production |
| **Visual Query Builder** | Drag-and-drop SQL construction | ✅ Production |
| **Dashboard Filters** | Date, text, and select filters across dashboards | ✅ Production |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Vizly Platform                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Frontend (React + TypeScript)                             │
│  ├── Modern UI with Tailwind CSS                          │
│  ├── 22+ Chart Types (ECharts, Nivo, Recharts)           │
│  ├── State Management (Zustand)                           │
│  └── Real-time Updates (Axios + JWT)                      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Backend (Django + DRF)                                    │
│  ├── REST API with JWT Authentication                     │
│  ├── SQL Query Validation & Execution                     │
│  ├── Connection Pooling (SQLAlchemy)                      │
│  ├── RBAC & Activity Logging                              │
│  ├── Scheduled Queries (Celery)                           │
│  └── AES-256 Credential Encryption                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Data Layer                                                │
│  ├── PostgreSQL (Recommended for production)              │
│  ├── MySQL (Full support)                                 │
│  └── SQLite (Development)                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+** with pip
- **Node.js 18+** with npm
- **PostgreSQL** (recommended) or MySQL/SQLite

### One-Command Setup

```bash
# Clone the repository
git clone https://github.com/huzaifa525/vizly.git
cd vizly

# Run automated setup (generates secure keys)
chmod +x setup_env.sh && ./setup_env.sh

# Start development
cd backend && python manage.py migrate && python manage.py runserver &
cd ../frontend && npm install && npm run dev
```

### Manual Setup

<details>
<summary><b>Click to expand manual setup instructions</b></summary>

#### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Generate secure credentials
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
python -c 'import os, base64; print(base64.b64encode(os.urandom(32)).decode())'

# Create .env file
cp .env.example .env
# Add generated SECRET_KEY and ENCRYPTION_SALT to .env

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver
```

#### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

</details>

### 🐳 Docker Deployment

```bash
# Development (with hot-reload)
docker-compose up -d

# Production (optimized)
docker-compose -f docker-compose.prod.yml up -d
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Django Admin: http://localhost:8000/admin
- API Docs: http://localhost:8000/api/schema/swagger-ui/

---

## 📊 Tech Stack

<div align="center">

### Backend
![Django](https://img.shields.io/badge/Django-5.0-092E20?style=for-the-badge&logo=django)
![DRF](https://img.shields.io/badge/DRF-3.14-red?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Celery](https://img.shields.io/badge/Celery-37814A?style=for-the-badge&logo=celery&logoColor=white)

### Frontend
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5.0-000000?style=for-the-badge)

</div>

### Key Dependencies

| Backend | Frontend |
|---------|----------|
| Django 5.0.1 | React 18.3.1 |
| Django REST Framework 3.14.0 | TypeScript 5.6.3 |
| SimpleJWT 5.3.1 | Vite 5.4.11 |
| SQLAlchemy 2.0.25 | Tailwind CSS 3.4.15 |
| Celery 5.3.4 | Zustand 5.0.1 |
| Pandas 2.2.0 | Recharts 2.14.1 |
| Cryptography 42.0.0 | ECharts 6.0.0 |
| drf-spectacular 0.27.0 | Nivo Charts 0.99.0 |

---

## 📖 Documentation

### 📚 Available Guides

- [**SECURITY.md**](SECURITY.md) - Complete security guide and best practices
- [**SECURITY_FIXES_APPLIED.md**](SECURITY_FIXES_APPLIED.md) - Detailed security changelog
- [**SECURITY_UPDATE_README.md**](SECURITY_UPDATE_README.md) - Quick start security guide
- [**ENV_SETUP_COMPLETE.md**](ENV_SETUP_COMPLETE.md) - Environment configuration guide
- [**ARCHITECTURE.md**](ARCHITECTURE.md) - System architecture documentation
- [**CONTRIBUTING.md**](CONTRIBUTING.md) - Contribution guidelines

### 🔐 Security Features

Vizly implements enterprise-grade security:

| Feature | Implementation |
|---------|---------------|
| **Authentication** | JWT with 15-minute access tokens, 7-day refresh |
| **Encryption** | AES-256 for database credentials |
| **SQL Injection** | Comprehensive query validation |
| **Rate Limiting** | 100/hr (anon), 10K/hr (auth) |
| **RBAC** | Admin, Analyst, Viewer roles |
| **Activity Logging** | All actions tracked with IP/user agent |
| **Security Headers** | XSS filter, HSTS, frame options |
| **CORS** | Configurable origins |

See [SECURITY.md](SECURITY.md) for complete security documentation.

---

## 🎯 Use Cases

### 🏢 Enterprise Analytics
- Real-time business metrics dashboards
- Executive KPI monitoring
- Department-specific reporting

### 📊 Data Teams
- Ad-hoc SQL querying
- Data exploration and visualization
- Query collaboration and sharing

### 🏥 Healthcare (Specialized)
Built by the creator of [MedGenius LLaMA-3.2B](https://huggingface.co/huzaifanw/MedGenius-LLaMA-3.2B), Vizly can be adapted for:
- Medical data analytics
- Patient outcome tracking
- Healthcare performance metrics

### 🎓 Education & Research
- Research data visualization
- Academic performance tracking
- Student analytics dashboards

---

## 🛠️ Development

### Project Structure

```
vizly/
├── backend/                    # Django Backend (4.4MB)
│   ├── vizly/                 # Main project config
│   ├── api/                   # Authentication
│   ├── connections/           # Database connections
│   ├── queries/               # SQL queries & validation
│   ├── visualizations/        # Charts & visualizations
│   ├── dashboards/            # Dashboard management
│   ├── rbac/                  # Role-based access control
│   ├── activity/              # Activity logging
│   └── requirements.txt
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/       # Reusable components (16)
│   │   ├── pages/            # Page components (15)
│   │   ├── services/         # API clients (6)
│   │   ├── stores/           # Zustand stores
│   │   └── types/            # TypeScript definitions
│   └── package.json
│
├── .env.example               # Environment template
├── setup_env.sh              # Automated setup script
├── docker-compose.yml        # Development Docker
└── docker-compose.prod.yml   # Production Docker
```

### Running Tests

```bash
# Backend tests
cd backend
python manage.py test

# With coverage
pip install pytest pytest-django pytest-cov
pytest --cov=. --cov-report=html

# Frontend tests
cd frontend
npm test
```

### Building for Production

```bash
# Backend
cd backend
python manage.py collectstatic --noinput
python manage.py migrate

# Frontend
cd frontend
npm run build
# Production build created in dist/
```

---

## 🔒 Security

### 🛡️ Built-In Security Features

Vizly has undergone comprehensive security audits and implements:

- ✅ **No default SECRET_KEY** - Forces secure configuration
- ✅ **SQL query validation** - Prevents dangerous operations
- ✅ **Unique encryption salt** - Per-installation security
- ✅ **Short-lived JWT tokens** - 15-minute access tokens
- ✅ **Rate limiting** - Prevents brute force attacks
- ✅ **Security headers** - XSS, clickjacking protection
- ✅ **Activity logging** - Complete audit trail
- ✅ **RBAC system** - Granular permissions

### 🔍 Security Audit Results

| Category | Status |
|----------|--------|
| Critical Vulnerabilities | ✅ 0/8 (All Fixed) |
| High Priority Issues | ✅ Addressed |
| Production Readiness | ✅ Yes |
| Security Grade | **A** |

**Last Security Audit**: November 2024

See [SECURITY.md](SECURITY.md) for complete security documentation.

---

## 🌐 API Documentation

### RESTful API Endpoints

<details>
<summary><b>Authentication</b></summary>

```bash
POST   /api/auth/register         # Register new user
POST   /api/auth/login            # Login (returns JWT)
GET    /api/auth/me               # Get current user
PUT    /api/auth/profile          # Update profile
POST   /api/auth/change-password  # Change password
```

</details>

<details>
<summary><b>Database Connections</b></summary>

```bash
GET    /api/connections/              # List all connections
POST   /api/connections/              # Create connection
GET    /api/connections/{id}/         # Get connection details
PUT    /api/connections/{id}/         # Update connection
DELETE /api/connections/{id}/         # Delete connection
POST   /api/connections/{id}/test/    # Test connection
POST   /api/connections/{id}/schema/  # Get database schema
```

</details>

<details>
<summary><b>SQL Queries</b></summary>

```bash
GET    /api/queries/                 # List queries
POST   /api/queries/                 # Create query
GET    /api/queries/{id}/            # Get query
PUT    /api/queries/{id}/            # Update query
DELETE /api/queries/{id}/            # Delete query
POST   /api/queries/{id}/execute/    # Execute saved query
POST   /api/queries/execute_raw/     # Execute raw SQL
POST   /api/queries/export_csv/      # Export to CSV
POST   /api/queries/export_excel/    # Export to Excel
POST   /api/queries/export_json/     # Export to JSON
```

</details>

<details>
<summary><b>RBAC & Activity</b></summary>

```bash
GET    /api/rbac/roles/              # List roles
GET    /api/rbac/user-roles/         # List user roles
POST   /api/rbac/user-roles/         # Assign role
DELETE /api/rbac/user-roles/{id}/    # Remove role

GET    /api/activity/logs/           # Activity logs
GET    /api/activity/stats/          # Activity statistics
```

</details>

**Interactive API Documentation**: http://localhost:8000/api/schema/swagger-ui/

---

## 🎨 Screenshots

<div align="center">

### Dashboard View
<img src="https://via.placeholder.com/800x450/0066cc/ffffff?text=Dashboard+with+Multiple+Visualizations" width="800"/>

### SQL Query Editor
<img src="https://via.placeholder.com/800x450/00cc66/ffffff?text=SQL+Editor+with+Syntax+Highlighting" width="800"/>

### Database Connections
<img src="https://via.placeholder.com/800x450/cc6600/ffffff?text=Database+Connection+Management" width="800"/>

</div>

---

## 📈 Roadmap

### ✅ Completed Features

- [x] Multi-database support (PostgreSQL, MySQL, SQLite)
- [x] SQL query editor with syntax highlighting
- [x] 22+ chart types with interactive visualizations
- [x] Dashboard builder with drag-and-drop
- [x] RBAC system (Admin, Analyst, Viewer)
- [x] Activity logging and audit trails
- [x] Query performance monitoring
- [x] Scheduled queries with cron support
- [x] Visual query builder
- [x] Dashboard filters
- [x] Export to CSV, Excel, JSON
- [x] Schema explorer
- [x] Connection pooling
- [x] AES-256 credential encryption
- [x] JWT authentication with token rotation

### 🚧 In Progress

- [ ] WebSocket support for real-time updates
- [ ] Advanced caching layer (Redis)
- [ ] Data warehouse integration (Snowflake, BigQuery)
- [ ] Custom SQL functions library

### 📅 Planned Features

- [ ] Email alerts and notifications
- [ ] Collaborative query editing
- [ ] Query versioning and history
- [ ] Advanced dashboard templates
- [ ] Mobile application
- [ ] API key management
- [ ] SSO integration (SAML, OAuth)
- [ ] Data lineage tracking
- [ ] Advanced alerting rules
- [ ] Embedded analytics (iframe support)

---

## 👨‍💻 About the Creator

<div align="center">

### Huzefa Nalkheda Wala

**AI Product Engineer @ CleverFlow | IIT Ropar AI Specialization**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-3K+_followers-0077B5?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/huzaifa525)
[![GitHub](https://img.shields.io/badge/GitHub-47_repos-181717?style=for-the-badge&logo=github)](https://github.com/huzaifa525)
[![Hugging Face](https://img.shields.io/badge/HuggingFace-5_models-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)](https://huggingface.co/huzaifanw)
[![Portfolio](https://img.shields.io/badge/Portfolio-huzaifa525.dev-00C4CC?style=for-the-badge&logo=google-chrome&logoColor=white)](https://huzaifa525.dev)

</div>

#### 🏆 Achievements

- 🚀 **AI Product Engineer** at CleverFlow (Dubai/India) - Building production AI systems handling 20K+ req/sec
- 🎓 **IIT Ropar** - Minor in Artificial Intelligence (2024-2025)
- 🤖 **MedGenius LLaMA-3.2B** - Created medical AI model trained on 40K+ healthcare records
- 🏆 **IBM World Hack Challenge Winner** - AI-Recruiter using IBM Watson
- 🥇 **Vadodara Startup Festival** - 1st rank among 250+ startups (25K+ participants)
- 📄 **Patent Holder** - Medical Equipment for Measuring Vital Parameters (Design No. 375474-001)
- ✍️ **Technical Writer** - 3K+ followers, published analyses on BLT, DeepSeek v2.5, Marco O1

#### 🔬 Research & Open Source

- **Medical Intelligence Dataset** - 40,443 healthcare records on Hugging Face & Kaggle
- **MedGenius LLaMA-3.2B** - Fine-tuned medical AI model (1.2K+ downloads)
- **Technical Publications** - AI architecture analyses with 2.5K+ views

#### 💼 Current Focus

- Building production-scale RAG systems at CleverFlow
- Advancing medical AI and healthcare technology
- LLM fine-tuning and specialized model development
- Computer vision applications in enterprise
- AI ethics and explainable AI research

**Connect**: [huzaifanalkhedaemp@gmail.com](mailto:huzaifanalkhedaemp@gmail.com)

---

## 🤝 Contributing

We welcome contributions from the community! Vizly is built to be extensible and community-driven.

### How to Contribute

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR-USERNAME/vizly.git`
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Commit** your changes: `git commit -m 'Add amazing feature'`
5. **Push** to your branch: `git push origin feature/amazing-feature`
6. **Open** a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Write comprehensive tests
- Update documentation for new features
- Keep pull requests focused and atomic
- Reference issues in commit messages

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### 🐛 Bug Reports

Found a bug? Please [open an issue](https://github.com/huzaifa525/vizly/issues) with:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- System information (OS, Python version, etc.)

### 💡 Feature Requests

Have an idea? We'd love to hear it! [Open a feature request](https://github.com/huzaifa525/vizly/issues/new?labels=enhancement) with:
- Detailed description of the feature
- Use case and benefits
- Possible implementation approach

---

## 📜 License

```
MIT License

Copyright (c) 2024 Huzefa Nalkheda Wala

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=huzaifa525/vizly&type=Date)](https://star-history.com/#huzaifa525/vizly&Date)

---

## 🙏 Acknowledgments

- Inspired by [Metabase](https://www.metabase.com/) - The gold standard in open-source BI
- [Django](https://www.djangoproject.com/) - The web framework for perfectionists with deadlines
- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- All open-source contributors who make projects like this possible

---

## 📞 Support & Community

- 💬 [GitHub Discussions](https://github.com/huzaifa525/vizly/discussions) - Ask questions, share ideas
- 🐛 [Issue Tracker](https://github.com/huzaifa525/vizly/issues) - Report bugs, request features
- 📧 [Email](mailto:huzaifanalkhedaemp@gmail.com) - Direct contact
- 🔗 [LinkedIn](https://linkedin.com/in/huzaifa525) - Professional network
- 🌐 [Portfolio](https://huzaifa525.dev) - More projects and research

---

<div align="center">

### ⭐ Star this repo if you find it useful!

**Built with ❤️ by [Huzefa Nalkheda Wala](https://huzaifa525.dev)**

*Transforming data into insights, one query at a time.*

</div>

---

**Keywords**: Business Intelligence, Data Visualization, Self-Hosted BI, Django, React, TypeScript, PostgreSQL, MySQL, SQL Editor, Dashboard Builder, Data Analytics, Open Source BI, Enterprise BI, RBAC, Activity Logging, Medical AI, Healthcare Analytics, Python BI Tool, TypeScript Dashboard, Metabase Alternative
