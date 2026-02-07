from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import UploadAttendanceView, RegisterView  # Make sure RegisterView is imported!

urlpatterns = [
    # --- Authentication Routes ---
    path('auth/register/', RegisterView.as_view(), name='auth_register'), # 👈 This was missing
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # --- Data Routes ---
    path('attendance/import/', UploadAttendanceView.as_view(), name='upload_csv'),
]