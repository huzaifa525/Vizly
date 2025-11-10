from rest_framework import serializers
from .models import Connection


class ConnectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Connection
        fields = ['id', 'name', 'type', 'host', 'port', 'database', 'username', 'password', 'ssl', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
