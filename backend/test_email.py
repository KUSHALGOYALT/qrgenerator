#!/usr/bin/env python
"""
Test script to verify email notification functionality.
"""
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hexaclimate.settings')
django.setup()

from api.models import Site, Incident
from api.utils import send_incident_notification_simple

def test_email_notification():
    """Test email notification functionality"""
    print("Testing email notification functionality...")
    
    # Get the first site
    site = Site.objects.first()
    if not site:
        print("No sites found in database")
        return
    
    # Create a test incident
    test_incident = Incident.objects.create(
        site=site,
        incident_type='unsafe_conditions',
        criticality='high',
        description='Test incident for email notification',
        is_anonymous=True
    )
    
    print(f"Created test incident: {test_incident}")
    print(f"Site: {test_incident.site.name}")
    print(f"Type: {test_incident.get_incident_type_display()}")
    print(f"Criticality: {test_incident.get_criticality_display()}")
    
    # Test email notification
    try:
        result = send_incident_notification_simple(test_incident)
        if result:
            print("✅ Email notification sent successfully!")
        else:
            print("❌ Failed to send email notification")
    except Exception as e:
        print(f"❌ Error sending email notification: {e}")
    
    # Clean up test incident
    test_incident.delete()
    print("Test incident cleaned up")

if __name__ == '__main__':
    test_email_notification() 