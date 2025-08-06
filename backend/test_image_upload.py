#!/usr/bin/env python
"""
Test script to verify image upload functionality
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hexaclimate.settings')
django.setup()

from api.models import Site, Incident, IncidentImage
from django.core.files import File
from django.core.files.temp import NamedTemporaryFile
from PIL import Image
import io

def create_test_image():
    """Create a simple test image"""
    # Create a simple test image
    img = Image.new('RGB', (100, 100), color='red')
    img_io = io.BytesIO()
    img.save(img_io, format='JPEG')
    img_io.seek(0)
    return img_io

def test_image_upload():
    """Test image upload functionality"""
    print("=== Testing Image Upload Functionality ===")
    
    # Get the first site
    try:
        site = Site.objects.first()
        if not site:
            print("❌ No sites found. Please create a site first.")
            return
        
        print(f"✅ Using site: {site.name}")
        
        # Create a test incident
        incident = Incident.objects.create(
            site=site,
            incident_type='unsafe_conditions',
            criticality='medium',
            description='Test incident with images',
            is_anonymous=True
        )
        print(f"✅ Created test incident: {incident.id}")
        
        # Create test images
        for i in range(3):
            img_io = create_test_image()
            
            # Create a temporary file
            with NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
                tmp_file.write(img_io.getvalue())
                tmp_file.flush()
                
                # Create IncidentImage
                incident_image = IncidentImage.objects.create(
                    incident=incident,
                    caption=f'Test image {i+1}'
                )
                
                # Save the image file
                with open(tmp_file.name, 'rb') as f:
                    incident_image.image.save(f'test_image_{i+1}.jpg', File(f), save=True)
                
                # Clean up temp file
                os.unlink(tmp_file.name)
                
                print(f"✅ Created test image {i+1}: {incident_image.image.url}")
        
        print(f"✅ Incident now has {incident.images.count()} images")
        
        # Test API response
        from api.serializers import IncidentSerializer
        serializer = IncidentSerializer(incident)
        data = serializer.data
        print(f"✅ API response has {len(data['images'])} images")
        
        return incident
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

if __name__ == "__main__":
    test_image_upload() 