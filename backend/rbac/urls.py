from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'roles', views.RoleViewSet, basename='role')
router.register(r'user-roles', views.UserRoleViewSet, basename='user-role')

urlpatterns = [
    path('', include(router.urls)),
    path('my-permissions/', views.get_my_permissions, name='my-permissions'),
    path('users/', views.get_all_users_with_roles, name='all-users'),
    path('assign-role/', views.assign_role_to_user, name='assign-role'),
    path('initialize/', views.initialize_default_roles, name='initialize-roles'),
]
