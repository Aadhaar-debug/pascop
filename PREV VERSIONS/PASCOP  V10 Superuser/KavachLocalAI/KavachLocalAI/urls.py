from django.urls import path
from . import views

urlpatterns = [
    path('model/', views.display_output, name='display_output'),
    # Add other URLs if needed
]
