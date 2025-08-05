# Hexa Climate QR Feedback System

A comprehensive safety feedback system with admin portal and public QR code access.

## Features

### Admin Portal
- **Site Management**: Create, edit, and delete sites with name and address
- **Emergency Contacts**: Manage emergency contacts per site (name, designation, phone)
- **Incident Viewing**: View all reported incidents across sites
- **QR Code Generation**: Generate QR codes for each site's public feedback form

### Public Feedback Portal
- **Site-Specific Forms**: Each site has its own feedback form accessible via QR code
- **Multiple Report Types**: 
  - Unsafe Conditions
  - Unsafe Actions
  - Near Miss
  - General Feedback
- **Anonymous Reporting**: Option to submit anonymously or with contact details
- **Emergency Contacts**: Display site-specific emergency contacts with click-to-call
- **Image Upload**: Support for image attachments in reports

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Django 4.2
- Django REST Framework
- PostgreSQL
- Pillow (image handling)

## Project Structure

```
hexaclimate-qr/
├── frontend/          # React application
├── backend/           # Django application
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- pip

### Installation

1. **Setup PostgreSQL database:**
```bash
# Install PostgreSQL if not already installed
# Create database
createdb hexaclimate
```

2. **Clone and setup backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file with database configuration
echo "DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=hexaclimate
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432" > .env

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

2. **Setup frontend:**
```bash
cd frontend
npm install
npm run dev
```

3. **Access the applications:**
- Admin Portal: http://localhost:3000
- Django Admin: http://localhost:8000/admin
- API: http://localhost:8000/api/

## API Endpoints

### Sites
- `GET /api/sites/` - List all sites
- `POST /api/sites/` - Create new site
- `GET /api/sites/{id}/` - Get site details
- `PUT /api/sites/{id}/` - Update site
- `DELETE /api/sites/{id}/` - Delete site

### Emergency Contacts
- `GET /api/emergency-contacts/` - List all contacts
- `POST /api/emergency-contacts/` - Create new contact
- `GET /api/sites/{id}/contacts/` - Get contacts for specific site

### Incidents
- `GET /api/incidents/` - List all incidents
- `POST /api/incidents/` - Create new incident
- `GET /api/sites/{id}/incidents/` - Get incidents for specific site

### QR Codes
- `GET /api/sites/{id}/qr-code/` - Generate QR code for site

## Environment Variables

Create a `.env` file in the backend directory:

```env
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=hexaclimate
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
```



## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

