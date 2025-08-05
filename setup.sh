#!/bin/bash

echo "🚀 Setting up Hexa Climate QR Feedback System"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup backend
echo "📦 Setting up Django backend..."
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
DEBUG=True
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(50))')
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=hexaclimate
DB_USER=postgres
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=5432
EOF
    echo "⚠️  Please update the DB_PASSWORD in backend/.env with your PostgreSQL password"
fi

# Run migrations
python manage.py migrate

echo "✅ Backend setup complete"

# Setup frontend
echo "📦 Setting up React frontend..."
cd ../frontend

# Install dependencies
npm install

echo "✅ Frontend setup complete"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update the DB_PASSWORD in backend/.env with your PostgreSQL password"
echo "2. Create a superuser: cd backend && source venv/bin/activate && python manage.py createsuperuser"
echo "3. Start the backend: cd backend && source venv/bin/activate && python manage.py runserver"
echo "4. Start the frontend: cd frontend && npm run dev"
echo ""
echo "Access the application at:"
echo "- Admin Portal: http://localhost:3000"
echo "- Django Admin: http://localhost:8000/admin"
echo "- API: http://localhost:8000/api/" 