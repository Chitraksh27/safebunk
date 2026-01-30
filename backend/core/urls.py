from django.urls import path
from .views import (
    DashboardView, 
    ImportAttendanceView, 
    ForecastView
)

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('import/', ImportAttendanceView.as_view(), name='import_attendance'),
    path('forecast/', ForecastView.as_view(), name='forecast'),
]