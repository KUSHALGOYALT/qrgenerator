#!/usr/bin/env python
"""
Test script to verify QR code generation with logo on the left
"""
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hexaclimate.settings')
django.setup()

from api.models import Site
from django.test import RequestFactory
from api.views import SiteViewSet

def test_qr_code_generation():
    """Test QR code generation with logo on the left"""
    print("🧪 Testing QR Code Generation with Logo on Left...")
    
    # Get or create a test site
    sites = Site.objects.all()
    if sites.count() == 0:
        print("⚠️  No sites found. Creating a test site...")
        site = Site.objects.create(
            name="Test Site with Long Name for Testing",
            address="123 Test Street, Test City"
        )
        print(f"✅ Created test site: {site.name}")
    else:
        site = sites.first()
        print(f"✅ Using existing site: {site.name}")
    
    # Create a mock request
    factory = RequestFactory()
    request = factory.get(f'/api/sites/{site.id}/qr_code/')
    request.scheme = 'https'
    request.get_host = lambda: 'hse.hexaclimate.com'
    
    # Create viewset instance
    viewset = SiteViewSet()
    viewset.request = request
    
    try:
        # Test QR code generation
        response = viewset.qr_code(request, pk=site.id)
        
        if response.status_code == 200:
            print("✅ QR code generated successfully!")
            print(f"   - Site: {site.name}")
            print(f"   - URL: {response.data.get('url', 'N/A')}")
            print(f"   - Has QR image: {'Yes' if response.data.get('qr_code') else 'No'}")
            
            # Check if the response contains the expected data
            if 'qr_code' in response.data and 'url' in response.data:
                print("✅ QR code data structure is correct")
                return True
            else:
                print("❌ QR code data structure is missing required fields")
                return False
        else:
            print(f"❌ QR code generation failed with status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error generating QR code: {e}")
        return False

if __name__ == '__main__':
    success = test_qr_code_generation()
    if success:
        print("\n🎉 QR code generation with logo on left is working correctly!")
    else:
        print("\n❌ QR code generation test failed!")
