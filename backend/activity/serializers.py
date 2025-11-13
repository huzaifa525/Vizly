from rest_framework import serializers
from .models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(read_only=True)
    description = serializers.CharField(read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    resource_type_display = serializers.CharField(source='get_resource_type_display', read_only=True)
    time_ago = serializers.SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = [
            'id', 'user', 'user_name', 'action', 'action_display',
            'resource_type', 'resource_type_display', 'resource_id', 'resource_name',
            'description', 'details', 'ip_address', 'created_at', 'time_ago'
        ]
        read_only_fields = fields

    def get_time_ago(self, obj):
        from django.utils.timesince import timesince
        return timesince(obj.created_at) + ' ago'
