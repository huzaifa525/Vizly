from rest_framework import serializers
from .models import Visualization
from queries.serializers import QuerySerializer


class VisualizationSerializer(serializers.ModelSerializer):
    query_details = QuerySerializer(source='query', read_only=True)

    class Meta:
        model = Visualization
        fields = ['id', 'name', 'type', 'config', 'query', 'query_details', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
