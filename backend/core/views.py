from .serializers import UserSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser
from .utils import parse_attendance_csv
import rest_framework.status as status

class DashboardView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        # Placeholder to prevent 404s
        return Response({
            "global": { "attended": 0, "conducted": 0, "percentage": 0 },
            "subjects": []
        })

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully."}, status = status.HTTP_201_CREATED)
        return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)
    
class UploadAttendanceView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]
    
    def post(self, request):
        if 'file' not in request.FILES:
            return Response({"error": "No file uploaded"}, status = 400)
        
        try:
            data = parse_attendance_csv(request.FILES['file'])
            return Response(data, status = 200)
        except ValueError as e:
            return Response({"error": str(e)}, status = 400)

class ForecastView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        return Response({"status": "Pending"}, status=status.HTTP_200_OK)