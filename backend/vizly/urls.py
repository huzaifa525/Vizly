"""
URL configuration for Vizly project.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def health_check(request):
    """Health check endpoint"""
    return JsonResponse({
        'status': 'ok',
        'service': 'vizly-api'
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check),
    path('api/auth/', include('api.urls')),
    path('api/connections/', include('connections.urls')),
    path('api/queries/', include('queries.urls')),
    path('api/dashboards/', include('dashboards.urls')),
    path('api/visualizations/', include('visualizations.urls')),
]
