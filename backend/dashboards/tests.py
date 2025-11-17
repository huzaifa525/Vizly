"""
Tests for the dashboards app
"""
import pytest
from django.urls import reverse
from rest_framework import status
from dashboards.models import Dashboard, DashboardItem
from visualizations.models import Visualization
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
        sql='SELECT * FROM users',
        connection=connection,
        user=user
    )


@pytest.fixture
def visualization(query):
    """Create a test visualization"""
    return Visualization.objects.create(
        name='Test Chart',
        type='bar',
        config={'x_axis': 'date', 'y_axis': 'count'},
        query=query
    )


@pytest.fixture
def dashboard(user):
    """Create a test dashboard"""
    return Dashboard.objects.create(
        name='Test Dashboard',
        description='A test dashboard',
        layout={'cols': 12, 'rows': 6},
        is_public=False,
        user=user
    )


@pytest.fixture
def dashboard_item(dashboard, visualization):
    """Create a test dashboard item"""
    return DashboardItem.objects.create(
        dashboard=dashboard,
        visualization=visualization,
        position={'x': 0, 'y': 0, 'w': 6, 'h': 4}
    )


@pytest.mark.django_db
class TestDashboardModel:
    """Test Dashboard model"""

    def test_create_dashboard(self, user):
        """Test creating a dashboard"""
        dashboard = Dashboard.objects.create(
            name='Sales Dashboard',
            description='Dashboard for sales metrics',
            layout={'cols': 12, 'rows': 8},
            is_public=True,
            user=user
        )
        assert dashboard.name == 'Sales Dashboard'
        assert dashboard.description == 'Dashboard for sales metrics'
        assert dashboard.layout == {'cols': 12, 'rows': 8}
        assert dashboard.is_public is True
        assert dashboard.user == user
        assert str(dashboard) == 'Sales Dashboard'

    def test_dashboard_ordering(self, user):
        """Test dashboards are ordered by updated_at descending"""
        dash1 = Dashboard.objects.create(
            name='Dashboard 1',
            user=user
        )
        dash2 = Dashboard.objects.create(
            name='Dashboard 2',
            user=user
        )
        dashboards = list(Dashboard.objects.all())
        assert dashboards[0] == dash2
        assert dashboards[1] == dash1


@pytest.mark.django_db
class TestDashboardItemModel:
    """Test DashboardItem model"""

    def test_create_dashboard_item(self, dashboard, visualization):
        """Test creating a dashboard item"""
        item = DashboardItem.objects.create(
            dashboard=dashboard,
            visualization=visualization,
            position={'x': 0, 'y': 0, 'w': 4, 'h': 3}
        )
        assert item.dashboard == dashboard
        assert item.visualization == visualization
        assert item.position == {'x': 0, 'y': 0, 'w': 4, 'h': 3}
        assert str(item) == f"{dashboard.name} - {visualization.name}"


@pytest.mark.django_db
class TestDashboardListAPI:
    """Test dashboard list endpoint"""

    def test_list_dashboards_authenticated(self, authenticated_client, dashboard):
        """Test listing dashboards when authenticated"""
        url = reverse('dashboard-list')
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'success'
        assert len(response.data['data']['dashboards']) == 1
        assert response.data['data']['dashboards'][0]['name'] == 'Test Dashboard'

    def test_list_dashboards_unauthenticated(self, api_client):
        """Test listing dashboards when not authenticated fails"""
        url = reverse('dashboard-list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_dashboards_only_user_dashboards(self, authenticated_client, dashboard, admin_user):
        """Test users only see their own dashboards"""
        # Create dashboard for admin user
        Dashboard.objects.create(
            name='Admin Dashboard',
            user=admin_user
        )

        url = reverse('dashboard-list')
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['data']['dashboards']) == 1
        assert response.data['data']['dashboards'][0]['name'] == 'Test Dashboard'


@pytest.mark.django_db
class TestDashboardRetrieveAPI:
    """Test dashboard retrieve endpoint"""

    def test_retrieve_dashboard(self, authenticated_client, dashboard):
        """Test retrieving a specific dashboard"""
        url = reverse('dashboard-detail', kwargs={'pk': dashboard.id})
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'success'
        assert response.data['data']['dashboard']['name'] == 'Test Dashboard'

    def test_retrieve_dashboard_with_items(self, authenticated_client, dashboard, dashboard_item):
        """Test retrieving a dashboard with items"""
        url = reverse('dashboard-detail', kwargs={'pk': dashboard.id})
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'success'

    def test_retrieve_nonexistent_dashboard(self, authenticated_client):
        """Test retrieving non-existent dashboard fails"""
        url = reverse('dashboard-detail', kwargs={'pk': '00000000-0000-0000-0000-000000000000'})
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data['status'] == 'error'


@pytest.mark.django_db
class TestDashboardCreateAPI:
    """Test dashboard create endpoint"""

    def test_create_dashboard(self, authenticated_client):
        """Test creating a new dashboard"""
        url = reverse('dashboard-list')
        data = {
            'name': 'New Dashboard',
            'description': 'A new test dashboard',
            'layout': {'cols': 12, 'rows': 6},
            'is_public': False
        }
        response = authenticated_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['status'] == 'success'
        assert response.data['data']['dashboard']['name'] == 'New Dashboard'
        assert Dashboard.objects.filter(name='New Dashboard').exists()

    def test_create_dashboard_minimal_fields(self, authenticated_client):
        """Test creating dashboard with only required fields"""
        url = reverse('dashboard-list')
        data = {
            'name': 'Minimal Dashboard'
        }
        response = authenticated_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['status'] == 'success'

    def test_create_dashboard_missing_name(self, authenticated_client):
        """Test creating dashboard without name fails"""
        url = reverse('dashboard-list')
        data = {
            'description': 'No name dashboard'
        }
        response = authenticated_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data['status'] == 'error'


@pytest.mark.django_db
class TestDashboardUpdateAPI:
    """Test dashboard update endpoint"""

    def test_update_dashboard(self, authenticated_client, dashboard):
        """Test updating a dashboard"""
        url = reverse('dashboard-detail', kwargs={'pk': dashboard.id})
        data = {
            'name': 'Updated Dashboard Name',
            'is_public': True
        }
        response = authenticated_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'success'

        dashboard.refresh_from_db()
        assert dashboard.name == 'Updated Dashboard Name'
        assert dashboard.is_public is True

    def test_update_nonexistent_dashboard(self, authenticated_client):
        """Test updating non-existent dashboard fails"""
        url = reverse('dashboard-detail', kwargs={'pk': '00000000-0000-0000-0000-000000000000'})
        data = {'name': 'Updated Name'}
        response = authenticated_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data['status'] == 'error'


@pytest.mark.django_db
class TestDashboardDeleteAPI:
    """Test dashboard delete endpoint"""

    def test_delete_dashboard(self, authenticated_client, dashboard):
        """Test deleting a dashboard"""
        dashboard_id = dashboard.id
        url = reverse('dashboard-detail', kwargs={'pk': dashboard_id})
        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'success'
        assert not Dashboard.objects.filter(id=dashboard_id).exists()

    def test_delete_dashboard_cascades_items(self, authenticated_client, dashboard, dashboard_item):
        """Test deleting a dashboard also deletes its items"""
        dashboard_id = dashboard.id
        item_id = dashboard_item.id
        url = reverse('dashboard-detail', kwargs={'pk': dashboard_id})
        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_200_OK
        assert not Dashboard.objects.filter(id=dashboard_id).exists()
        assert not DashboardItem.objects.filter(id=item_id).exists()

    def test_delete_nonexistent_dashboard(self, authenticated_client):
        """Test deleting non-existent dashboard fails"""
        url = reverse('dashboard-detail', kwargs={'pk': '00000000-0000-0000-0000-000000000000'})
        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data['status'] == 'error'
