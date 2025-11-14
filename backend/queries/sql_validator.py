"""
SQL Query Validation Utilities

This module provides security validation for user-submitted SQL queries
to prevent dangerous operations and SQL injection attacks.
"""
import re
import logging
from typing import Tuple

logger = logging.getLogger('queries')

# Dangerous SQL keywords that should be blocked for non-admin users
DANGEROUS_KEYWORDS = [
    # DDL Operations
    'DROP', 'CREATE', 'ALTER', 'TRUNCATE', 'RENAME',
    # Grant/Revoke
    'GRANT', 'REVOKE',
    # Database operations
    'USE', 'DATABASE',
    # System commands
    'EXEC', 'EXECUTE', 'CALL', 'PROCEDURE',
    # File operations (MySQL/PostgreSQL specific)
    'INTO OUTFILE', 'INTO DUMPFILE', 'LOAD DATA', 'LOAD_FILE',
    # PostgreSQL specific dangerous functions
    'PG_SLEEP', 'PG_READ_FILE', 'COPY',
]

# Dangerous patterns that might indicate malicious queries
DANGEROUS_PATTERNS = [
    r';\s*DROP',  # Stacked queries attempting to drop
    r';\s*DELETE',  # Stacked queries attempting to delete
    r';\s*UPDATE',  # Stacked queries attempting to update
    r';\s*INSERT',  # Stacked queries attempting to insert
    r'--\s*$',  # Comment at end (potential SQL injection)
    r'/\*.*\*/',  # Block comments (can hide malicious code)
    r'xp_cmdshell',  # SQL Server command execution
    r'script',  # XSS attempts
]


def validate_sql_query(sql: str, user_is_admin: bool = False) -> Tuple[bool, str]:
    """
    Validate a SQL query for security concerns.

    Args:
        sql: The SQL query to validate
        user_is_admin: Whether the user is an admin (admins have more permissions)

    Returns:
        Tuple of (is_valid, error_message)
        - is_valid: True if query is safe, False otherwise
        - error_message: Description of the issue if invalid, empty string if valid
    """
    if not sql or not sql.strip():
        return False, "SQL query cannot be empty"

    sql_upper = sql.upper()
    sql_stripped = sql.strip()

    # Check for dangerous keywords (only for non-admin users)
    if not user_is_admin:
        for keyword in DANGEROUS_KEYWORDS:
            if keyword in sql_upper:
                logger.warning(f"Blocked query with dangerous keyword: {keyword}")
                return False, f"Query contains forbidden operation: {keyword}"

    # Check for dangerous patterns (apply to all users)
    for pattern in DANGEROUS_PATTERNS:
        if re.search(pattern, sql, re.IGNORECASE):
            logger.warning(f"Blocked query with dangerous pattern: {pattern}")
            return False, "Query contains potentially dangerous pattern"

    # Non-admin users should only be able to run SELECT queries
    if not user_is_admin:
        # Allow SELECT, WITH (for CTEs), and SHOW/DESCRIBE/EXPLAIN for introspection
        allowed_starts = ['SELECT', 'WITH', 'SHOW', 'DESCRIBE', 'DESC', 'EXPLAIN']
        first_keyword = sql_upper.lstrip().split()[0] if sql_upper.strip() else ''

        if first_keyword not in allowed_starts:
            logger.warning(f"Non-admin user attempted non-SELECT query: {first_keyword}")
            return False, "Only SELECT queries are allowed for non-admin users"

    # Check for multiple statements (stacked queries)
    # This is a basic check - more sophisticated parsing might be needed
    semicolon_count = sql.count(';')
    if semicolon_count > 1:
        logger.warning("Blocked query with multiple statements")
        return False, "Multiple SQL statements are not allowed"

    # If there's one semicolon, it should be at the end
    if semicolon_count == 1 and not sql_stripped.endswith(';'):
        logger.warning("Blocked query with semicolon not at end")
        return False, "Semicolon must be at the end of the query only"

    # Check for excessive length (potential DoS)
    if len(sql) > 50000:  # 50KB limit
        logger.warning(f"Blocked query exceeding length limit: {len(sql)} chars")
        return False, "Query exceeds maximum length of 50,000 characters"

    # All checks passed
    return True, ""


def sanitize_error_message(error: str) -> str:
    """
    Sanitize error messages to avoid exposing sensitive information.

    Args:
        error: The raw error message from the database

    Returns:
        Sanitized error message safe to show to users
    """
    # Remove potential file paths
    error = re.sub(r'[A-Za-z]:\\[^\s]+', '[PATH]', error)
    error = re.sub(r'/[^\s]+', '[PATH]', error)

    # Remove potential IP addresses
    error = re.sub(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', '[IP]', error)

    # Remove potential usernames in connection strings
    error = re.sub(r'user[=\s]+[^\s]+', 'user=[REDACTED]', error, flags=re.IGNORECASE)
    error = re.sub(r'password[=\s]+[^\s]+', 'password=[REDACTED]', error, flags=re.IGNORECASE)

    # Limit length
    if len(error) > 500:
        error = error[:500] + "... (truncated)"

    return error


def validate_table_name(table_name: str) -> bool:
    """
    Validate a table name to prevent SQL injection.

    Args:
        table_name: The table name to validate

    Returns:
        True if the table name is valid, False otherwise
    """
    # Table names should only contain alphanumeric characters, underscores, and dots
    # No spaces, quotes, or special characters
    if not table_name:
        return False

    # Check length
    if len(table_name) > 128:
        return False

    # Allow alphanumeric, underscore, and dot (for schema.table)
    pattern = r'^[a-zA-Z0-9_\.]+$'
    return bool(re.match(pattern, table_name))


def validate_column_name(column_name: str) -> bool:
    """
    Validate a column name to prevent SQL injection.

    Args:
        column_name: The column name to validate

    Returns:
        True if the column name is valid, False otherwise
    """
    # Column names should only contain alphanumeric characters and underscores
    if not column_name:
        return False

    # Check length
    if len(column_name) > 128:
        return False

    # Allow alphanumeric and underscore only
    pattern = r'^[a-zA-Z0-9_]+$'
    return bool(re.match(pattern, column_name))
