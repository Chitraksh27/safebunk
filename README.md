# SafeSkip

A smart attendance tracking and forecasting application that helps students monitor their attendance across subjects and plan their leaves strategically to maintain required attendance percentages.

## Features

- 📊 **Attendance Tracking**: Import and manage attendance data across multiple subjects
- 🎯 **Target Management**: Set and track attendance percentage targets for each subject (default: 75%)
- ⚖️ **Weighted Hours**: Support for different session durations (Lectures: 1hr, Labs: 3hrs)
- 🔒 **User Authentication**: Secure JWT-based login and registration system
- 📥 **Smart CSV Import**: Intelligent CSV parser with flexible column mapping
  - Supports various CSV formats and column names
  - Automatically detects subject name, type, present/absent counts
  - Handles OD (On Duty), Makeup classes in attendance calculation
- 📱 **Responsive UI**: Modern interface built with React and Tailwind CSS
- 🔄 **Real-time Calculations**: Dynamic attendance percentage computation with weighted hours

## Tech Stack

### Backend
- **Django 6.0** - Web framework
- **Django REST Framework 3.16** - RESTful API
- **PostgreSQL** - Database (with SQLite fallback support)
- **Django CORS Headers** - Cross-origin resource sharing
- **djangorestframework-simplejwt** - JWT authentication
- **Python 3.x** - Programming language

### Frontend
- **React 19.2** - UI library
- **Vite 7.2** - Build tool and dev server
- **React Router 7.11** - Navigation
- **Axios 1.13** - HTTP client
- **Tailwind CSS 3.4** - Styling framework
- **Recharts 3.6** - Data visualization
- **Lucide React 0.562** - Icon library
- **Vercel Analytics** - Performance monitoring

## Project Structure

```
safeskip/
├── backend/                # Django backend
│   ├── backend/           # Project settings
│   │   ├── settings.py    # Django configuration
│   │   ├── urls.py        # Main URL routing
│   │   └── wsgi.py        # WSGI configuration
│   ├── core/              # Main application
│   │   ├── models.py      # Data models (Subject, SessionType, AttendanceLog)
│   │   ├── views.py       # API endpoints
│   │   ├── serializers.py # DRF serializers
│   │   ├── urls.py        # App URL routing
│   │   ├── importer.py    # Smart CSV importer with column mapping
│   │   ├── utils.py       # Attendance parsing utilities
│   │   ├── admin.py       # Django admin configuration
│   │ 
│   ├── manage.py
│   ├── requirements.txt
│   ├── pytest.ini
│   └── db.sqlite3
└── frontend/              # React frontend
    ├── src/
    │   ├── components/    # Reusable components
    │   │   ├── ForecastPlanner.jsx
    │   │   └── ImportModal.jsx
    │   ├── pages/         # Page components
    │   │   ├── Dashboard.jsx
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   ├── context/       # React context
    │   │   └── AuthContext.jsx
    │   ├── services/      # API service
    │   │   └── api.js
    │   ├── App.jsx        # Main app component
    │   └── main.jsx       # Entry point
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── vercel.json        # Vercel deployment config
```

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn
- PostgreSQL (recommended) or SQLite for development

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

Or install core packages manually:
```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers psycopg2-binary dj-database-url python-dotenv whitenoise
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Create a superuser (optional):
```bash
python manage.py createsuperuser
```

6. Start the development server:
```bash
python manage.py runserver
```

The backend will run at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login and get JWT tokens (access & refresh)
- `POST /api/auth/refresh/` - Refresh access token

### Attendance Management
- `POST /api/attendance/import/` - Import attendance data from CSV
  - Requires: Multipart form data with `file` field
  - Supports: Smart column mapping from various CSV formats
  - Returns: Parsed attendance data with weighted hours calculation

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Import Data**: Upload attendance data via CSV format
   - Supports flexible CSV formats with intelligent column mapping
   - Automatically calculates weighted hours based on session type
   - Handles Present, Absent, OD, and Makeup classes
3. **View Dashboard**: Monitor current attendance status across all subjects
4. **Track Progress**: Keep track of how close you are to your target percentage (default: 75%)

## Testing

Run backend tests with pytest:
```bash
cd backend
pytest
```

Test files include:
- `test_models.py` - Model logic and calculations
- `test_import.py` - CSV import functionality
- `test_forecast.py` - Forecasting algorithms

## Development

### Running in Development Mode

**Backend:**
```bash
cd backend
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is created for educational purposes as part of placement training.

## Author

[Chitraksh Sharma](https://linkedin.com/in/chitraksh-sharma)

---

**Note**: This application is designed to help students track their attendance responsibly. Always prioritize attending classes and use the forecasting feature only for legitimate planning purposes.
