from rest_framework import serializers
from .models import Query
from connections.serializers import ConnectionSerializer


class QuerySerializer(serializers.ModelSerializer):
    connection_details = ConnectionSerializer(source='connection', read_only=True)

    class Meta:
        model = Query
        fields = ['id', 'name', 'description', 'sql', 'connection', 'connection_details', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
