import csv
import io
import re

def parse_attendance_csv(file_obj):
    """
    Signature-Based Parser.
    If it sees the exact structure of 'Attendance Report.csv', it HARDCODES indices.
    No guessing allowed.
    """
    try:
        decoded_file = file_obj.read().decode('utf-8-sig')
        io_string = io.StringIO(decoded_file)
        rows = list(csv.reader(io_string))
        
        if not rows: raise ValueError("Empty CSV")

        # 1. Clean Headers
        headers = [h.lower().strip() for h in rows[0] if h]
        
        # 2. DEFINE INDICES (Default: -1)
        # We will set these manually if we detect your file signature
        subj_idx = -1
        type_idx = -1
        present_idx = -1
        od_idx = -1
        makeup_idx = -1
        absent_idx = -1

        # 🕵️‍♂️ SIGNATURE DETECTION
        # Your file has: "#, Subject Code, Subject, Subject Type, Present, ..."
        is_known_format = (
            len(headers) > 4 and 
            "code" in headers[1] and 
            "subject" in headers[2] and 
            "present" in headers[4]
        )

        if is_known_format:
            print("✅ SIGNATURE DETECTED: Standard Attendance Report")
            # HARDCODE THE INDICES (0-based)
            # 0: #
            # 1: Subject Code (The Trap!)
            subj_idx = 2     # Subject Name
            type_idx = 3     # Subject Type
            present_idx = 4  # Present
            od_idx = 5       # OD
            makeup_idx = 6   # Makeup
            absent_idx = 7   # Absent
        else:
            # Fallback for weird files (Scan by name)
            print("⚠️ UNKNOWN FORMAT: Scanning headers by name...")
            for i, h in enumerate(headers):
                if "subject" in h and "code" not in h and "type" not in h: subj_idx = i
                elif "type" in h or "session" in h: type_idx = i
                elif "present" in h: present_idx = i
                elif "od" in h: od_idx = i
                elif "makeup" in h: makeup_idx = i
                elif "absent" in h: absent_idx = i

        if subj_idx == -1 or present_idx == -1:
            raise ValueError("Could not map columns. Please use the standard Attendance Report format.")

        results = []
        global_stats = {'attended': 0, 'conducted': 0}

        for row in rows[1:]:
            if not row or len(row) < 5: continue
            
            # Safe Value Accessor
            def val(idx): 
                return row[idx].strip() if idx != -1 and idx < len(row) else ""

            name = val(subj_idx)
            if not name or "total" in name.lower() or "subject" in name.lower(): continue

            # Number Cleaner
            def clean(v):
                s = re.sub(r'[^\d.]', '', str(v))
                try: return int(float(s))
                except: return 0

            # 3. EXTRACT DATA
            p = clean(val(present_idx))
            od = clean(val(od_idx))
            mu = clean(val(makeup_idx))
            a = clean(val(absent_idx))

            # 4. APPLY WEIGHTS (Lab = 3 hrs)
            subject_type = val(type_idx) or 'Lecture'
            weight = 3 if 'lab' in subject_type.lower() else 1

            attended_hours = (p + od + mu) * weight
            absent_hours = a * weight
            conducted_hours = attended_hours + absent_hours
            
            # Avoid Division by Zero
            pct = (attended_hours / conducted_hours * 100) if conducted_hours > 0 else 0

            global_stats['attended'] += attended_hours
            global_stats['conducted'] += conducted_hours

            results.append({
                "id": name,
                "name": name,
                "type": subject_type,
                "attended": attended_hours,
                "conducted": conducted_hours,
                "percentage": round(pct, 2)
            })

        global_pct = (global_stats['attended'] / global_stats['conducted'] * 100) if global_stats['conducted'] > 0 else 0

        return {
            "global": {
                "attended": global_stats['attended'],
                "conducted": global_stats['conducted'],
                "percentage": round(global_pct, 2)
            },
            "subjects": results
        }

    except Exception as e:
        print(f"ERROR: {e}")
        raise ValueError(f"Parser Error: {str(e)}")