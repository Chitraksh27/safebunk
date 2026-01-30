from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.models import User
from .models import Subject, AttendanceLog, SessionType
from .services import import_attendance_data
import traceback

class DashboardView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user = User.objects.first()
        if not user:
            return Response({"error": "No users found. Run 'python manage.py createsuperuser'"}, status=400)

        subjects = Subject.objects.filter(user=user)
        subject_data = []
        global_attended = 0
        global_conducted = 0

        for sub in subjects:
            sessions = SessionType.objects.filter(subject=sub)
            logs = AttendanceLog.objects.filter(session_type__in=sessions)
            total = logs.count()
            present = logs.filter(status__in=['Present', 'PRESENT', 'P']).count()
            
            pct = (present / total * 100) if total > 0 else 0
            global_attended += present
            global_conducted += total
            
            subject_data.append({
                "id": sub.id,
                "name": sub.name,
                "type": sessions.first().name if sessions.exists() else "Class",
                "attended": present,
                "conducted": total,
                "percentage": round(pct, 1)
            })

        global_pct = (global_attended / global_conducted * 100) if global_conducted > 0 else 100
        
        return Response({
            "global": {
                "attended": global_attended,
                "conducted": global_conducted,
                "percentage": round(global_pct, 1)
            },
            "subjects": subject_data
        })

class ImportAttendanceView(APIView):
    permission_classes = [AllowAny]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        user = User.objects.first()
        if not user:
             return Response({"error": "No users found. Run createsuperuser."}, status=400)

        if 'file' not in request.FILES:
            return Response({"error": "No file uploaded."}, status=400)
        
        try:
            csv_text = request.FILES['file'].read().decode('utf-8')
            summary = import_attendance_data(user, csv_text)
            return Response({"message": "Import Successful", "summary": summary}, status=200)
        except Exception as e:
            trace = traceback.format_exc()
            print("❌ IMPORT CRASHED:\n" + trace)
            return Response({"error": str(e)}, status=500)

class ForecastView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        return Response({"status": "Forecast pending"}, status=200)