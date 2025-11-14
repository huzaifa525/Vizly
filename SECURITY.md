# Security Guide for Vizly

This document outlines the security features implemented in Vizly and best practices for secure deployment.

## Critical Security Updates (Latest Version)

### ✅ Implemented Security Features

1. **No Default SECRET_KEY**: The application will not start without a properly configured SECRET_KEY
2. **SQL Injection Prevention**: All SQL queries are validated before execution
3. **Rate Limiting**: API endpoints are protected against brute force attacks
4. **Short-lived JWT Tokens**: Access tokens expire after 15 minutes
5. **Unique Encryption Salt**: Each installation uses a unique salt for credential encryption
6. **Security Headers**: XSS filter, content sniffing prevention, and frame options enabled
7. **Password Validation**: Strong password requirements using Django validators
8. **RBAC System**: Role-based access control for fine-grained permissions

## Initial Setup

### 1. Generate SECRET_KEY

The SECRET_KEY is required and has no default value. Generate a secure key:

```bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

Add to your `.env` file:
```
SECRET_KEY=your-generated-secret-key-here
```

### 2. Generate ENCRYPTION_SALT

For consistent encryption across restarts, generate and save a unique salt:

```bash
python -c 'import os, base64; print(base64.b64encode(os.urandom(32)).decode())'
```

Add to your `.env` file:
```
ENCRYPTION_SALT=your-generated-salt-here
```

**Note**: If you don't set this, a salt will be auto-generated on first run and logged. You should copy it to your `.env` file.

### 3. Configure Production Settings

In your `.env` file for production:

```bash
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://user:password@localhost:5432/vizly
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

## Security Features Explained

### 1. SQL Query Validation

All user-submitted SQL queries are validated before execution:

**For Non-Admin Users:**
- Only SELECT queries are allowed
- DDL operations (CREATE, DROP, ALTER, etc.) are blocked
- Stacked queries (multiple statements) are blocked
- Dangerous patterns (comments, SQL injection attempts) are detected

**For Admin Users:**
- More permissive, but still validates for dangerous patterns
- Can execute DDL operations
- Still protected against obvious SQL injection attempts

### 2. Rate Limiting

Default rate limits:
- **Anonymous users**: 100 requests/hour
- **Authenticated users**: 10,000 requests/hour

Configure in `settings.py`:
```python
'DEFAULT_THROTTLE_RATES': {
    'anon': '100/hour',
    'user': '10000/hour',
}
```

### 3. JWT Token Security

- **Access tokens**: 15 minutes (short-lived)
- **Refresh tokens**: 7 days
- **Token rotation**: Enabled (refresh tokens are rotated on use)
- **Blacklisting**: Old tokens are blacklisted after rotation

### 4. Password Security

Passwords are validated using Django's built-in validators:
- Minimum length (8 characters)
- Not too similar to user attributes
- Not a commonly used password
- Not entirely numeric

Database passwords are encrypted using:
- **Algorithm**: Fernet (AES-256)
- **Key derivation**: PBKDF2 with 100,000 iterations
- **Unique salt**: Per installation

### 5. Security Headers

Enabled in production (`DEBUG=False`):
- `X-Frame-Options: DENY` (prevents clickjacking)
- `X-Content-Type-Options: nosniff` (prevents MIME sniffing)
- `X-XSS-Protection: 1; mode=block` (XSS protection)
- `Strict-Transport-Security: max-age=31536000` (HSTS)
- `Secure` and `HttpOnly` flags on cookies

### 6. CORS Protection

CORS is configured to only allow requests from specified origins:
```python
CORS_ALLOWED_ORIGINS = ['http://localhost:5173', 'https://yourdomain.com']
CORS_ALLOW_CREDENTIALS = True
```

## Production Deployment Checklist

Before deploying to production:

- [ ] Set `DEBUG=False` in `.env`
- [ ] Generate and set unique `SECRET_KEY`
- [ ] Generate and set unique `ENCRYPTION_SALT`
- [ ] Configure `ALLOWED_HOSTS` with your domain(s)
- [ ] Use PostgreSQL instead of SQLite for `DATABASE_URL`
- [ ] Set up HTTPS/SSL for your domain
- [ ] Configure `CORS_ALLOWED_ORIGINS` with your frontend URL
- [ ] Review and adjust rate limiting settings
- [ ] Set up database backups
- [ ] Configure log rotation
- [ ] Review user roles and permissions (RBAC)
- [ ] Run database migrations: `python manage.py migrate`
- [ ] Create superuser: `python manage.py createsuperuser`
- [ ] Collect static files: `python manage.py collectstatic`

## Security Best Practices

### Database Connections

1. **Never share database connections between users**
   - Each user should have their own connections
   - Use read-only database users for regular users
   - Restrict database user permissions appropriately

2. **Rotate database credentials regularly**
   - Update passwords in Vizly when you rotate credentials
   - Old encrypted passwords will not decrypt with new salt/key

### User Management

1. **Use RBAC system**
   - Assign appropriate roles (Admin, Analyst, Viewer)
   - Regular users should not have admin privileges
   - Review permissions regularly

2. **Monitor activity logs**
   - Check for suspicious query patterns
   - Monitor failed authentication attempts
   - Review query execution history

### Query Execution

1. **Set appropriate limits**
   - `MAX_QUERY_TIMEOUT`: Prevent long-running queries
   - `MAX_RESULT_ROWS`: Prevent memory exhaustion
   - Review these limits based on your use case

2. **Audit queries**
   - Review saved queries periodically
   - Check for queries that could be optimized
   - Monitor query performance

## Reporting Security Issues

If you discover a security vulnerability, please email security@vizly.example.com (update with your email).

**Please do NOT open a public GitHub issue for security vulnerabilities.**

We will respond within 48 hours and work with you to resolve the issue.

## Security Updates

Always keep Vizly and its dependencies up to date:

```bash
# Backend
pip install -r requirements.txt --upgrade

# Frontend
npm update

# Check for known vulnerabilities
pip-audit  # Install with: pip install pip-audit
npm audit
```

## Additional Security Measures

### 1. Web Application Firewall (WAF)

Consider deploying behind a WAF like:
- Cloudflare
- AWS WAF
- ModSecurity

### 2. Intrusion Detection

Monitor logs with tools like:
- Fail2ban (for repeated failed logins)
- OSSEC
- Wazuh

### 3. Regular Security Audits

- Run security scanners (Bandit for Python, npm audit)
- Perform penetration testing
- Review access logs regularly

## References

- [Django Security Documentation](https://docs.djangoproject.com/en/stable/topics/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Django REST Framework Security](https://www.django-rest-framework.org/topics/security/)
