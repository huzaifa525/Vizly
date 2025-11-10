"""
WSGI config for Vizly project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vizly.settings')

application = get_wsgi_application()
