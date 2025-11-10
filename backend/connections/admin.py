from django.contrib import admin
from .models import Connection


@admin.register(Connection)
class ConnectionAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'host', 'database', 'user', 'created_at']
    list_filter = ['type', 'created_at']
    search_fields = ['name', 'database', 'host']
    readonly_fields = ['id', 'created_at', 'updated_at']
