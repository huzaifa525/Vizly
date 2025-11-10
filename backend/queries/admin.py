from django.contrib import admin
from .models import Query


@admin.register(Query)
class QueryAdmin(admin.ModelAdmin):
    list_display = ['name', 'connection', 'user', 'created_at', 'updated_at']
    list_filter = ['connection__type', 'created_at']
    search_fields = ['name', 'description', 'sql']
    readonly_fields = ['id', 'created_at', 'updated_at']
