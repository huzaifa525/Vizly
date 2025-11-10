"""Database connection services"""
from sqlalchemy import create_engine, text


def test_database_connection(connection):
    """Test if database connection works"""
    try:
        engine = create_connection_engine(connection)
        with engine.connect() as conn:
            conn.execute(text('SELECT 1'))
        return {'success': True, 'message': f'{connection.type.title()} connection successful'}
    except Exception as e:
        raise Exception(f'Connection failed: {str(e)}')


def create_connection_engine(connection):
    """Create SQLAlchemy engine from connection"""
    if connection.type == 'postgres':
        url = f"postgresql://{connection.username}:{connection.password}@{connection.host}:{connection.port or 5432}/{connection.database}"
    elif connection.type == 'mysql':
        url = f"mysql+mysqldb://{connection.username}:{connection.password}@{connection.host}:{connection.port or 3306}/{connection.database}"
    elif connection.type == 'sqlite':
        url = f"sqlite:///{connection.database}"
    else:
        raise ValueError(f"Unsupported database type: {connection.type}")

    return create_engine(url)


def execute_query(connection, sql):
    """Execute SQL query on external database"""
    try:
        engine = create_connection_engine(connection)
        with engine.connect() as conn:
            result = conn.execute(text(sql))

            if result.returns_rows:
                columns = [{'name': col, 'type': str(type(val))} for col, val in zip(result.keys(), next(result, []))]
                conn.execute(text(sql))  # Re-execute to get all rows
                result = conn.execute(text(sql))
                rows = [dict(row._mapping) for row in result]

                return {
                    'columns': columns,
                    'rows': rows,
                    'rowCount': len(rows)
                }
            else:
                return {
                    'columns': [],
                    'rows': [],
                    'rowCount': result.rowcount
                }
    except Exception as e:
        raise Exception(f'Query execution failed: {str(e)}')
