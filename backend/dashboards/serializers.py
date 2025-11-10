from rest_framework import serializers
from .models import Dashboard, DashboardItem
from visualizations.serializers import VisualizationSerializer


class DashboardItemSerializer(serializers.ModelSerializer):
    visualization_details = VisualizationSerializer(source='visualization', read_only=True)

    class Meta:
        model = DashboardItem
        fields = ['id', 'visualization', 'visualization_details', 'position', 'created_at']
        read_only_fields = ['id', 'created_at']


class DashboardSerializer(serializers.ModelSerializer):
    items = DashboardItemSerializer(many=True, read_only=True)

    class Meta:
        model = Dashboard
        fields = ['id', 'name', 'description', 'layout', 'is_public', 'items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
