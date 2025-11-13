from django.urls import path
from . import views

urlpatterns = [
    path('register', views.register, name='register'),
    path('login', views.login, name='login'),
    path('me', views.get_current_user, name='get_current_user'),
    path('profile', views.update_profile, name='update_profile'),
    path('change-password', views.change_password, name='change_password'),
]
