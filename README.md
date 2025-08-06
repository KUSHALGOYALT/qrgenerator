# Hexa Climate 

A comprehensive Health, Safety, and Environment (HSE) feedback system with admin portal and public QR code access, featuring live camera capture for incident reporting.

## Features

### Admin Portal
- **Site Management**: Create, edit, and delete sites with name and address
- **Emergency Contacts**: Manage emergency contacts per site (name, designation, phone)
- **Incident Viewing**: View all reported incidents across sites with image support
- **QR Code Generation**: Generate QR codes for each site's public feedback form
- **Image Management**: View and manage incident images with full-size preview

### Public Feedback Portal
- **Site-Specific Forms**: Each site has its own feedback form accessible via QR code
- **Multiple Report Types**: 
  - Unsafe Conditions
  - Unsafe Actions
  - Near Miss
  - General Feedback
- **Live Camera Capture**: Take photos directly using device camera
- **Image Upload**: Support for uploading existing images from gallery
- **Anonymous Reporting**: Option to submit anonymously or with contact details
- **Emergency Contacts**: Display site-specific emergency contacts with click-to-call

### Camera Capture Features
- **Live Camera Preview**: Real-time camera feed for photo capture
- **Mobile Optimized**: Automatically uses back camera on mobile devices
- **Error Handling**: Comprehensive error handling for camera permissions
- **Device Support Detection**: Graceful fallback for unsupported devices
- **Image Quality**: High-quality JPEG capture with configurable settings

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- MediaDevices API (camera functionality)

### Backend
- Django 4.2
- Django REST Framework
- PostgreSQL
- Pillow (image handling)
- CORS support for media files

## Project Structure

```
hexaclimate-qr/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions (camera utils)
│   └── public/        # Static assets
├── backend/           # Django application
│   ├── api/           # Django app
│   ├── media/         # Uploaded files
│   └── templates/     # Email templates
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- pip
- PostgreSQL

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

3. **Setup frontend:**
```bash
cd frontend
npm install
npm run dev
```

4. **Access the applications:**
- Admin Portal: https://hse.hexaclimate.com (requires authentication)
- Public Feedback: https://hse.hexaclimate.com/public/{site-id} (public access)
- Django Admin: https://hse.hexaclimate.com/hex/admin/
- API: https://hse.hexaclimate.com/hex/api/

### Authentication

The admin portal is now protected with authentication:

- **Username:** `admin`
- **Password:** `hexaclimate2024`

**Public Access:**
- Only the public feedback form (accessed via QR code) is publicly accessible
- All admin pages require authentication
- Users are redirected to login page when accessing protected routes

### Email Notifications

The system includes robust email notification handling:

**Features:**
- **Graceful Failure**: Email errors won't break the main application
- **Automatic Notifications**: Incident reports trigger email notifications
- **Configurable Recipients**: Manage notification emails via admin interface
- **Development Mode**: Uses console backend for development (emails printed to console)

**Testing Email Functionality:**
```bash
# Test SMTP connection (if configured)
python manage.py test_email --test-smtp

# Test notification emails
python manage.py test_email --test-notification
```

**Email Configuration:**
- Currently uses console backend for development
- SMTP configuration can be added later without breaking the app
- Email timeouts prevent hanging
- All email operations are wrapped in try-catch blocks

## Camera Capture Setup

The camera capture feature requires:

1. **HTTPS in Production**: Camera access requires secure context (HTTPS) in production
2. **User Permissions**: Users must grant camera permissions when prompted
3. **Device Support**: Works on devices with camera support

### Camera Features:
- **Automatic Detection**: Detects device camera support
- **Permission Handling**: Proper error messages for denied permissions
- **Mobile Optimization**: Uses back camera on mobile devices
- **Fallback Support**: File upload available when camera is not supported

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
- `POST /api/incidents/` - Create new incident (supports image upload)
- `GET /api/sites/{id}/incidents/` - Get incidents for specific site

### QR Codes
- `GET /api/sites/{id}/qr_code/` - Generate QR code for site

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

## Camera Capture Usage

### For Users:
1. **Access Public Form**: Scan QR code or visit public feedback URL
2. **Select Incident Type**: Choose the type of incident to report
3. **Take Photo**: Click "Take Photo" to capture live image
4. **Upload Image**: Alternatively, click "Choose File" to upload existing image
5. **Fill Details**: Complete the incident description and submit

### For Administrators:
1. **View Incidents**: Navigate to Incidents section in admin portal
2. **View Images**: Click on image thumbnails to see full-size images
3. **Manage Content**: Edit, delete, or respond to incidents as needed

## Troubleshooting

### Camera Issues:
- **Permission Denied**: Check browser camera permissions
- **No Camera Found**: Ensure device has camera hardware
- **HTTPS Required**: Use HTTPS in production for camera access

### Image Display Issues:
- **Images Not Loading**: Check media file serving configuration
- **CORS Errors**: Verify CORS settings in Django
- **Proxy Issues**: Ensure Vite proxy is configured for media files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

