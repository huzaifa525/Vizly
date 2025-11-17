"""
Tests for the queries app
"""
import pytest
from django.urls import reverse
from rest_framework import status
from queries.models import Query
from connections.models import Connection


@pytest.fixture
def connection(user):
    """Create a test database connection"""
    return Connection.objects.create(
        name='Test PostgreSQL',
        type='postgres',
        host='localhost',
        port=5432,
        database='testdb',
        username='testuser',
        password='testpass',
        user=user
    )


@pytest.fixture
def query(user, connection):
    """Create a test query"""
    return Query.objects.create(
        name='Test Query',
        description='A test query',
        sql='SELECT * FROM users',
        connection=connection,
        user=user
    )


@pytest.mark.django_db
class TestQueryModel:
    """Test Query model"""

    def test_create_query(self, user, connection):
        """Test creating a query"""
        query = Query.objects.create(
            name='Sample Query',
            description='Get all orders',
            sql='SELECT * FROM orders',
            connection=connection,
            user=user
        )
        assert query.name == 'Sample Query'
        assert query.description == 'Get all orders'
        assert query.sql == 'SELECT * FROM orders'
        assert query.connection == connection
        assert query.user == user
        assert str(query) == 'Sample Query'

    def test_query_ordering(self, user, connection):
        """Test queries are ordered by updated_at descending"""
        query1 = Query.objects.create(
            name='Query 1',
            sql='SELECT 1',
            connection=connection,
            user=user
        )
        query2 = Query.objects.create(
            name='Query 2',
            sql='SELECT 2',
            connection=connection,
            user=user
        )
        queries = list(Query.objects.all())
        assert queries[0] == query2
        assert queries[1] == query1


@pytest.mark.django_db
class TestQueryListAPI:
    """Test query list endpoint"""

    def test_list_queries_authenticated(self, authenticated_client, query):
        """Test listing queries when authenticated"""
        url = reverse('query-list')
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'success'
        assert len(response.data['data']['queries']) == 1
        assert response.data['data']['queries'][0]['name'] == 'Test Query'

    def test_list_queries_unauthenticated(self, api_client):
        """Test listing queries when not authenticated fails"""
        url = reverse('query-list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_queries_only_user_queries(self, authenticated_client, query, admin_user, connection):
        """Test users only see their own queries"""
        # Create connection and query for admin user
        admin_connection = Connection.objects.create(
            name='Admin Connection',
            type='mysql',
            database='admindb',
            user=admin_user
        )
        Query.objects.create(
            name='Admin Query',
            sql='SELECT * FROM admin_table',
            connection=admin_connection,
            user=admin_user
        )

        url = reverse('query-list')
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['data']['queries']) == 1
        assert response.data['data']['queries'][0]['name'] == 'Test Query'


@pytest.mark.django_db
class TestQueryRetrieveAPI:
    """Test query retrieve endpoint"""

    def test_retrieve_query(self, authenticated_client, query):
        """Test retrieving a specific query"""
        url = reverse('query-detail', kwargs={'pk': query.id})
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'success'
        assert response.data['data']['query']['name'] == 'Test Query'

    def test_retrieve_nonexistent_query(self, authenticated_client):
        """Test retrieving non-existent query fails"""
        url = reverse('query-detail', kwargs={'pk': '00000000-0000-0000-0000-000000000000'})
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data['status'] == 'error'


@pytest.mark.django_db
class TestQueryCreateAPI:
    """Test query create endpoint"""

    def test_create_query(self, authenticated_client, connection):
        """Test creating a new query"""
        url = reverse('query-list')
        data = {
            'name': 'New Query',
            'description': 'A new test query',
            'sql': 'SELECT * FROM products',
            'connection': str(connection.id)
        }
        response = authenticated_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['status'] == 'success'
        assert response.data['data']['query']['name'] == 'New Query'
        assert Query.objects.filter(name='New Query').exists()

    def test_create_query_missing_fields(self, authenticated_client, connection):
        """Test creating query with missing required fields fails"""
        url = reverse('query-list')
        data = {
            'name': 'Incomplete Query'
        }
        response = authenticated_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data['status'] == 'error'

    def test_create_query_invalid_connection(self, authenticated_client):
        """Test creating query with invalid connection fails"""
        url = reverse('query-list')
        data = {
            'name': 'Invalid Query',
            'sql': 'SELECT 1',
            'connection': '00000000-0000-0000-0000-000000000000'
        }
        response = authenticated_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data['status'] == 'error'


@pytest.mark.django_db
class TestQueryUpdateAPI:
    """Test query update endpoint"""

    def test_update_query(self, authenticated_client, query):
        """Test updating a query"""
        url = reverse('query-detail', kwargs={'pk': query.id})
        data = {
            'name': 'Updated Query Name',
            'sql': 'SELECT * FROM updated_table'
        }
        response = authenticated_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'success'

        query.refresh_from_db()
        assert query.name == 'Updated Query Name'
        assert query.sql == 'SELECT * FROM updated_table'

    def test_update_nonexistent_query(self, authenticated_client):
        """Test updating non-existent query fails"""
        url = reverse('query-detail', kwargs={'pk': '00000000-0000-0000-0000-000000000000'})
        data = {'name': 'Updated Name'}
        response = authenticated_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data['status'] == 'error'


@pytest.mark.django_db
class TestQueryDeleteAPI:
    """Test query delete endpoint"""

    def test_delete_query(self, authenticated_client, query):
        """Test deleting a query"""
        query_id = query.id
        url = reverse('query-detail', kwargs={'pk': query_id})
        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'success'
        assert not Query.objects.filter(id=query_id).exists()

    def test_delete_nonexistent_query(self, authenticated_client):
        """Test deleting non-existent query fails"""
        url = reverse('query-detail', kwargs={'pk': '00000000-0000-0000-0000-000000000000'})
        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data['status'] == 'error'


@pytest.mark.django_db
class TestQueryExecuteRawAPI:
    """Test execute raw query endpoint"""

    def test_execute_raw_missing_params(self, authenticated_client):
        """Test executing raw query without required params fails"""
        url = reverse('query-execute-raw')
        data = {}
        response = authenticated_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data['status'] == 'error'
        assert 'connection_id and sql are required' in response.data['message']

    def test_execute_raw_invalid_connection(self, authenticated_client):
        """Test executing raw query with invalid connection fails"""
        url = reverse('query-execute-raw')
        data = {
            'connection_id': '00000000-0000-0000-0000-000000000000',
            'sql': 'SELECT 1'
        }
        response = authenticated_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data['status'] == 'error'
