# Generated manually for initial migration

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Connection',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('type', models.CharField(choices=[('postgres', 'PostgreSQL'), ('mysql', 'MySQL'), ('sqlite', 'SQLite')], max_length=20)),
                ('host', models.CharField(blank=True, max_length=255, null=True)),
                ('port', models.IntegerField(blank=True, null=True)),
                ('database', models.CharField(max_length=255)),
                ('username', models.CharField(blank=True, max_length=255, null=True)),
                ('password', models.CharField(blank=True, max_length=255, null=True)),
                ('ssl', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='connections', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'connections',
                'ordering': ['-created_at'],
            },
        ),
    ]
