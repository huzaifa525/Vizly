"""
URL configuration for Vizly project.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static


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

# Serve static files in all modes (including with gunicorn)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
