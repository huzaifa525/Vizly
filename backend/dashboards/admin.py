from django.contrib import admin
from .models import Dashboard, DashboardItem


class DashboardItemInline(admin.TabularInline):
    model = DashboardItem
    extra = 0


@admin.register(Dashboard)
class DashboardAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'is_public', 'created_at', 'updated_at']
    list_filter = ['is_public', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    inlines = [DashboardItemInline]


@admin.register(DashboardItem)
class DashboardItemAdmin(admin.ModelAdmin):
    list_display = ['dashboard', 'visualization', 'created_at']
    list_filter = ['created_at']
    search_fields = ['dashboard__name', 'visualization__name']
    readonly_fields = ['id', 'created_at']
