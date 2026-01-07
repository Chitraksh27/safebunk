import csv
import io
from datetime import datetime, timedelta
from django.db.models import Sum
from decimal import Decimal
from .models import Subject, AttendanceLog, SessionType
from .importer import SmartImporter  

def import_attendance_data(user, csv_text):
    """
    Parses CSV data using SmartImporter and updates the database.
    """

    importer = SmartImporter(csv_text)
    clean_data = importer.parse()

    logs_created = 0
    subjects_found = set()

    for entry in clean_data:
        subject_name = entry['subject']
        if not subject_name:
            continue

        
        subject, _ = Subject.objects.get_or_create(
            user=user,
            name__iexact=subject_name,
            defaults={'name': subject_name}
        )
        subjects_found.add(subject.name)

        
        type_name = entry['type']
        session_type, _ = SessionType.objects.get_or_create(
            name__iexact=type_name,
            defaults={'name': type_name, 'weight': 1.0}
        )
       
        subject.session_types.add(session_type)

    
        status_raw = entry['status'].strip().upper()
        
        is_present = status_raw in ['PRESENT', 'P', 'YES', 'ATTENDED']
        status = 'Present' if is_present else 'Absent'

      
        AttendanceLog.objects.update_or_create(
            subject=subject,
            date=entry['date'],
            session_type=session_type,
            defaults={'status': status}
        )
        logs_created += 1

    return {
        "status": "success",
        "mode": importer.mode,
        "logs_created": logs_created,
        "subjects": list(subjects_found)
    }

def calculate_forecast(user, simulations):
    """
    (This function remains unchanged as it doesn't depend on the import logic)
    """
    
    subject_state = {} 
    global_state = {'attended': Decimal(0), 'conducted': Decimal(0)}

    
    all_subjects = Subject.objects.filter(user=user)
    for sub in all_subjects:
        stats = sub.current_status_details
        global_state['attended'] += stats['attended_hours']
        global_state['conducted'] += stats['conducted_hours']
        subject_state[sub.id] = stats

    results = []
    
    for sim in simulations:
        sub_id = sim['subject_id']
        action = sim.get('action', 'SKIP').upper()
        
        
        weight = Decimal(sim.get('weight', 1.0))
        
        if sub_id in subject_state:
            stats = subject_state[sub_id]
            if action == 'ATTEND':
                stats['attended_hours'] += weight
                stats['conducted_hours'] += weight
                global_state['attended'] += weight
                global_state['conducted'] += weight
            elif action == 'SKIP':
                stats['conducted_hours'] += weight
                global_state['conducted'] += weight
            
            new_sub_pct = (stats['attended_hours'] / stats['conducted_hours']) * 100
            new_global_pct = (global_state['attended'] / global_state['conducted']) * 100
            
            results.append({
                "subject_impact": {"subject_id": sub_id, "new_percentage": round(new_sub_pct, 2)},
                "global_percentage": round(new_global_pct, 2)
            })
    return results