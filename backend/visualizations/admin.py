from django.contrib import admin
from .models import Visualization


@admin.register(Visualization)
class VisualizationAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'query', 'created_at']
    list_filter = ['type', 'created_at']
    search_fields = ['name', 'query__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
