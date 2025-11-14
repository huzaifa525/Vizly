"""
Database connection services with enhanced security and performance.

Features:
- Connection pooling for better performance
- Query timeouts to prevent long-running queries
- Result size limits to prevent memory exhaustion
- Comprehensive logging
"""
import logging
from sqlalchemy import create_engine, text, event
from sqlalchemy.pool import QueuePool
from django.conf import settings

logger = logging.getLogger(__name__)

# Configuration
MAX_QUERY_TIMEOUT = getattr(settings, 'MAX_QUERY_TIMEOUT', 30)  # seconds
MAX_RESULT_ROWS = getattr(settings, 'MAX_RESULT_ROWS', 10000)
CONNECTION_POOL_SIZE = getattr(settings, 'CONNECTION_POOL_SIZE', 5)
CONNECTION_POOL_MAX_OVERFLOW = getattr(settings, 'CONNECTION_POOL_MAX_OVERFLOW', 10)

# Connection pool cache
_engine_cache = {}


def test_database_connection(connection):
    """Test if database connection works"""
    try:
        logger.info(f"Testing connection: {connection.name} ({connection.type})")
        engine = create_connection_engine(connection)
        with engine.connect() as conn:
            # Set timeout for test query
            _set_query_timeout(conn, connection.type, timeout=5)
            conn.execute(text('SELECT 1'))
        logger.info(f"Connection test successful: {connection.name}")
        return {'success': True, 'message': f'{connection.type.title()} connection successful'}
    except Exception as e:
        logger.error(f"Connection test failed for {connection.name}: {str(e)}")
        raise Exception(f'Connection failed: {str(e)}')


def create_connection_engine(connection, use_pool=True):
    """
    Create SQLAlchemy engine from connection with pooling.

    Args:
        connection: Connection model instance
        use_pool: Whether to use connection pooling (default: True)

    Returns:
        SQLAlchemy Engine instance
    """
    cache_key = f"{connection.id}_{connection.updated_at.timestamp()}"

    # Return cached engine if available and pooling is enabled
    if use_pool and cache_key in _engine_cache:
        logger.debug(f"Using cached engine for connection: {connection.name}")
        return _engine_cache[cache_key]

    # Build connection URL
    if connection.type == 'postgres':
        url = f"postgresql://{connection.username}:{connection.get_decrypted_password()}@{connection.host}:{connection.port or 5432}/{connection.database}"
        if connection.ssl:
            url += "?sslmode=require"
    elif connection.type == 'mysql':
        url = f"mysql+mysqldb://{connection.username}:{connection.get_decrypted_password()}@{connection.host}:{connection.port or 3306}/{connection.database}"
        if connection.ssl:
            url += "?ssl=true"
    elif connection.type == 'sqlite':
        url = f"sqlite:///{connection.database}"
    else:
        raise ValueError(f"Unsupported database type: {connection.type}")

    # Create engine with pooling
    engine_kwargs = {
        'echo': settings.DEBUG,
        'future': True,
    }

    if use_pool and connection.type != 'sqlite':  # SQLite doesn't benefit from pooling
        engine_kwargs.update({
            'poolclass': QueuePool,
            'pool_size': CONNECTION_POOL_SIZE,
            'max_overflow': CONNECTION_POOL_MAX_OVERFLOW,
            'pool_pre_ping': True,  # Verify connections before using
            'pool_recycle': 3600,   # Recycle connections after 1 hour
        })

    engine = create_engine(url, **engine_kwargs)

    # Cache engine if pooling is enabled
    if use_pool:
        _engine_cache[cache_key] = engine
        logger.info(f"Created pooled engine for connection: {connection.name}")

    return engine


def _set_query_timeout(conn, db_type, timeout=None):
    """
    Set query timeout for the connection.

    Args:
        conn: SQLAlchemy connection
        db_type: Database type (postgres, mysql, sqlite)
        timeout: Timeout in seconds (default: MAX_QUERY_TIMEOUT)
    """
    if timeout is None:
        timeout = MAX_QUERY_TIMEOUT

    timeout_ms = timeout * 1000

    try:
        if db_type == 'postgres':
            conn.execute(text(f"SET statement_timeout = {timeout_ms}"))
        elif db_type == 'mysql':
            conn.execute(text(f"SET SESSION max_execution_time = {timeout_ms}"))
        elif db_type == 'sqlite':
            # SQLite doesn't have built-in query timeout, handled at Python level
            pass
        logger.debug(f"Set query timeout to {timeout}s for {db_type}")
    except Exception as e:
        logger.warning(f"Failed to set query timeout: {str(e)}")


def execute_query(connection, sql, timeout=None, max_rows=None):
    """
    Execute SQL query on external database with safety limits.

    Args:
        connection: Connection model instance
        sql: SQL query string
        timeout: Query timeout in seconds (default: MAX_QUERY_TIMEOUT)
        max_rows: Maximum rows to return (default: MAX_RESULT_ROWS)

    Returns:
        dict with columns, rows, rowCount, and metadata

    Raises:
        Exception: If query execution fails or limits are exceeded
    """
    if timeout is None:
        timeout = MAX_QUERY_TIMEOUT
    if max_rows is None:
        max_rows = MAX_RESULT_ROWS

    logger.info(f"Executing query on connection: {connection.name}")
    logger.debug(f"SQL: {sql[:200]}...")  # Log first 200 chars

    try:
        engine = create_connection_engine(connection)

        with engine.connect() as conn:
            # Set query timeout
            _set_query_timeout(conn, connection.type, timeout)

            # Execute query
            result = conn.execute(text(sql))

            if result.returns_rows:
                # Get column metadata
                columns = [
                    {
                        'name': col,
                        'type': str(result._metadata.keys[i].type)
                    }
                    for i, col in enumerate(result.keys())
                ]

                # Fetch rows with limit
                rows = []
                for i, row in enumerate(result):
                    if i >= max_rows:
                        logger.warning(f"Query exceeded max rows ({max_rows}), truncating results")
                        break
                    rows.append(dict(row._mapping))

                row_count = len(rows)
                truncated = row_count >= max_rows

                logger.info(f"Query returned {row_count} rows (truncated: {truncated})")

                return {
                    'columns': columns,
                    'rows': rows,
                    'rowCount': row_count,
                    'truncated': truncated,
                    'maxRows': max_rows,
                    'executionTime': None,  # Could add timing if needed
                }
            else:
                # Non-SELECT query (INSERT, UPDATE, DELETE, etc.)
                affected_rows = result.rowcount
                logger.info(f"Query affected {affected_rows} rows")

                return {
                    'columns': [],
                    'rows': [],
                    'rowCount': affected_rows,
                    'truncated': False,
                }
    except Exception as e:
        logger.error(f"Query execution failed on {connection.name}: {str(e)}")
        raise Exception(f'Query execution failed: {str(e)}')


def get_database_schema(connection):
    """
    Get database schema (tables and columns) for introspection.

    Args:
        connection: Connection model instance

    Returns:
        dict with tables list, each containing name, columns, and metadata
    """
    logger.info(f"Fetching schema for connection: {connection.name}")

    try:
        engine = create_connection_engine(connection)

        with engine.connect() as conn:
            _set_query_timeout(conn, connection.type, timeout=10)

            if connection.type == 'postgres':
                tables = _get_postgres_schema(conn)
            elif connection.type == 'mysql':
                tables = _get_mysql_schema(conn)
            elif connection.type == 'sqlite':
                tables = _get_sqlite_schema(conn)
            else:
                raise ValueError(f"Schema introspection not supported for {connection.type}")

            logger.info(f"Retrieved schema with {len(tables)} tables")
            return {'tables': tables}

    except Exception as e:
        logger.error(f"Schema introspection failed for {connection.name}: {str(e)}")
        raise Exception(f'Schema introspection failed: {str(e)}')


def _get_postgres_schema(conn):
    """Get schema for PostgreSQL"""
    query = text("""
        SELECT
            t.table_name,
            c.column_name,
            c.data_type,
            c.is_nullable,
            c.column_default,
            tc.constraint_type
        FROM information_schema.tables t
        LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
        LEFT JOIN information_schema.key_column_usage kcu ON c.table_name = kcu.table_name AND c.column_name = kcu.column_name
        LEFT JOIN information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name
        WHERE t.table_schema = 'public'
        ORDER BY t.table_name, c.ordinal_position
    """)

    result = conn.execute(query)
    return _process_schema_result(result)


def _get_mysql_schema(conn):
    """Get schema for MySQL"""
    query = text("""
        SELECT
            t.TABLE_NAME as table_name,
            c.COLUMN_NAME as column_name,
            c.DATA_TYPE as data_type,
            c.IS_NULLABLE as is_nullable,
            c.COLUMN_DEFAULT as column_default,
            c.COLUMN_KEY as constraint_type
        FROM information_schema.TABLES t
        LEFT JOIN information_schema.COLUMNS c ON t.TABLE_NAME = c.TABLE_NAME
        WHERE t.TABLE_SCHEMA = DATABASE()
        ORDER BY t.TABLE_NAME, c.ORDINAL_POSITION
    """)

    result = conn.execute(query)
    return _process_schema_result(result)


def _get_sqlite_schema(conn):
    """Get schema for SQLite"""
    # Get all tables
    tables_query = text("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    tables_result = conn.execute(tables_query)

    tables = []
    for table_row in tables_result:
        table_name = table_row[0]

        # Get columns for each table
        # Security: Use parameterized query to prevent SQL injection
        # SQLite PRAGMA doesn't support parameters, so we validate the table name
        # Only allow alphanumeric characters, underscores, and ensure it exists in sqlite_master
        if not table_name.replace('_', '').isalnum():
            logger.warning(f"Invalid table name detected: {table_name}")
            continue

        columns_query = text(f"PRAGMA table_info(`{table_name}`)")
        columns_result = conn.execute(columns_query)

        columns = []
        for col in columns_result:
            columns.append({
                'name': col[1],
                'type': col[2],
                'nullable': not col[3],
                'default': col[4],
                'primary_key': bool(col[5]),
            })

        tables.append({
            'name': table_name,
            'columns': columns,
        })

    return tables


def _process_schema_result(result):
    """Process schema query result into structured format"""
    tables_dict = {}

    for row in result:
        table_name = row[0]
        if not table_name:
            continue

        if table_name not in tables_dict:
            tables_dict[table_name] = {
                'name': table_name,
                'columns': []
            }

        if row[1]:  # column_name
            column = {
                'name': row[1],
                'type': row[2],
                'nullable': row[3] == 'YES',
                'default': row[4],
                'primary_key': row[5] == 'PRIMARY KEY' if len(row) > 5 else False,
            }
            tables_dict[table_name]['columns'].append(column)

    return list(tables_dict.values())


def clear_connection_cache():
    """Clear the connection engine cache"""
    global _engine_cache
    logger.info("Clearing connection engine cache")
    _engine_cache.clear()
