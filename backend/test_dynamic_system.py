#!/usr/bin/env python
"""
Test script to verify the dynamic incident handling system
"""
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hexaclimate.settings')
django.setup()

from api.models import Site, IncidentType, Incident
from django.core.exceptions import ObjectDoesNotExist

def test_dynamic_incident_system():
    """Test the dynamic incident handling system"""
    print("🧪 Testing Dynamic Incident Handling System...")
    
    # Test 1: Check if sites exist
    sites = Site.objects.all()
    print(f"✅ Found {sites.count()} sites")
    
    if sites.count() == 0:
        print("⚠️  No sites found. Creating a test site...")
        site = Site.objects.create(
            name="Test Site",
            address="123 Test Street, Test City"
        )
        print(f"✅ Created test site: {site.name}")
    else:
        site = sites.first()
        print(f"✅ Using existing site: {site.name}")
    
    # Test 2: Check if incident types exist for the site
    incident_types = IncidentType.objects.filter(site=site)
    print(f"✅ Found {incident_types.count()} incident types for site '{site.name}'")
    
    if incident_types.count() == 0:
        print("⚠️  No incident types found. Creating default types...")
        default_types = [
            {
                'name': 'unsafe_conditions',
                'display_name': 'Unsafe Conditions',
                'description': 'Report unsafe conditions or hazards in the workplace',
                'requires_criticality': True,
                'order': 1
            },
            {
                'name': 'unsafe_actions',
                'display_name': 'Unsafe Actions',
                'description': 'Report unsafe actions or behaviors',
                'requires_criticality': True,
                'order': 2
            },
            {
                'name': 'near_miss',
                'display_name': 'Near Miss',
                'description': 'Report near miss incidents',
                'requires_criticality': True,
                'order': 3
            },
            {
                'name': 'general_feedback',
                'display_name': 'General Feedback',
                'description': 'General feedback or suggestions',
                'requires_criticality': False,
                'order': 4
            }
        ]
        
        for type_data in default_types:
            incident_type = IncidentType.objects.create(
                site=site,
                **type_data
            )
            print(f"✅ Created incident type: {incident_type.display_name}")
    
    # Test 3: List all incident types
    print("\n📋 All incident types:")
    for it in IncidentType.objects.filter(site=site).order_by('order'):
        print(f"  - {it.display_name} (requires_criticality: {it.requires_criticality}, active: {it.is_active})")
    
    # Test 4: Test creating a custom incident type
    try:
        custom_type = IncidentType.objects.create(
            site=site,
            name='custom_feedback',
            display_name='Custom Feedback',
            description='A custom feedback type for testing',
            requires_criticality=False,
            order=5
        )
        print(f"\n✅ Created custom incident type: {custom_type.display_name}")
    except Exception as e:
        print(f"❌ Error creating custom incident type: {e}")
    
    # Test 5: Test creating an incident with dynamic incident type
    try:
        # Get an incident type
        incident_type = IncidentType.objects.filter(site=site).first()
        if incident_type:
            # Create a test incident
            incident = Incident.objects.create(
                site=site,
                incident_type=incident_type,
                description='Test incident for dynamic system',
                is_anonymous=True
            )
            print(f"\n✅ Created test incident: {incident}")
            print(f"   - Incident Type: {incident.incident_type.display_name}")
            print(f"   - Requires Criticality: {incident.incident_type.requires_criticality}")
            
            # Clean up test incident
            incident.delete()
            print("✅ Cleaned up test incident")
        else:
            print("❌ No incident types available for testing")
    except Exception as e:
        print(f"❌ Error creating test incident: {e}")
    
    # Test 6: Check active incident types
    active_types = IncidentType.objects.filter(site=site, is_active=True).order_by('order')
    print(f"\n✅ Active incident types: {active_types.count()}")
    for it in active_types:
        print(f"  - {it.display_name}")
    
    # Test 7: Test deleting a custom incident type
    try:
        custom_type = IncidentType.objects.get(site=site, name='custom_feedback')
        custom_type.delete()
        print("✅ Deleted custom incident type")
    except ObjectDoesNotExist:
        print("ℹ️  Custom incident type not found (already deleted or never created)")
    
    print("\n🎉 Dynamic incident handling system test completed successfully!")
    print("\n📊 Summary:")
    print(f"   - Sites: {Site.objects.count()}")
    print(f"   - Incident Types: {IncidentType.objects.count()}")
    print(f"   - Active Incident Types: {IncidentType.objects.filter(is_active=True).count()}")
    print(f"   - Incidents: {Incident.objects.count()}")

if __name__ == '__main__':
    test_dynamic_incident_system()
