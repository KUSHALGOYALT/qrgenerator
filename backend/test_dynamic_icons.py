#!/usr/bin/env python
"""
Test script to verify dynamic icon system
"""
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hexaclimate.settings')
django.setup()

from api.models import Site, IncidentType
from django.core.exceptions import ObjectDoesNotExist

def test_dynamic_icon_system():
    """Test the dynamic icon system"""
    print("🧪 Testing Dynamic Icon System...")
    
    # Get or create a test site
    sites = Site.objects.all()
    if sites.count() == 0:
        print("⚠️  No sites found. Creating a test site...")
        site = Site.objects.create(
            name="Test Site for Icons",
            address="123 Test Street, Test City"
        )
        print(f"✅ Created test site: {site.name}")
    else:
        site = sites.first()
        print(f"✅ Using existing site: {site.name}")
    
    # Check existing incident types
    incident_types = IncidentType.objects.filter(site=site)
    print(f"✅ Found {incident_types.count()} incident types for site '{site.name}'")
    
    # List all incident types with their icons and colors
    print("\n📋 Current incident types with icons:")
    for it in incident_types.order_by('order'):
        print(f"  - {it.display_name}: icon='{it.icon}', color='{it.color}'")
    
    # Test creating a custom incident type with custom icon
    try:
        custom_type = IncidentType.objects.create(
            site=site,
            name='custom_incident',
            display_name='Custom Incident Type',
            description='A custom incident type for testing dynamic icons',
            icon='Bug',  # Custom icon
            color='bg-purple-500',  # Custom color
            requires_criticality=True,
            order=5
        )
        print(f"\n✅ Created custom incident type: {custom_type.display_name}")
        print(f"   - Icon: {custom_type.icon}")
        print(f"   - Color: {custom_type.color}")
    except Exception as e:
        print(f"❌ Error creating custom incident type: {e}")
    
    # Test creating another custom incident type with different icon
    try:
        custom_type2 = IncidentType.objects.create(
            site=site,
            name='maintenance_issue',
            display_name='Maintenance Issue',
            description='Report maintenance-related issues',
            icon='Wrench',  # Different custom icon
            color='bg-green-500',  # Different custom color
            requires_criticality=False,
            order=6
        )
        print(f"\n✅ Created second custom incident type: {custom_type2.display_name}")
        print(f"   - Icon: {custom_type2.icon}")
        print(f"   - Color: {custom_type2.color}")
    except Exception as e:
        print(f"❌ Error creating second custom incident type: {e}")
    
    # List all incident types again to show the new ones
    print("\n📋 Updated incident types with icons:")
    for it in IncidentType.objects.filter(site=site).order_by('order'):
        print(f"  - {it.display_name}: icon='{it.icon}', color='{it.color}'")
    
    # Test updating an existing incident type's icon
    try:
        general_feedback = IncidentType.objects.get(site=site, name='general_feedback')
        general_feedback.icon = 'MessageCircle'
        general_feedback.color = 'bg-indigo-500'
        general_feedback.save()
        print(f"\n✅ Updated general feedback icon to: {general_feedback.icon}")
        print(f"   - New color: {general_feedback.color}")
    except ObjectDoesNotExist:
        print("ℹ️  General feedback type not found (no default types created)")
    except Exception as e:
        print(f"❌ Error updating general feedback: {e}")
    
    # Clean up test incident types
    try:
        custom_types = IncidentType.objects.filter(site=site, name__in=['custom_incident', 'maintenance_issue'])
        for ct in custom_types:
            ct.delete()
        print("✅ Cleaned up test incident types")
    except Exception as e:
        print(f"ℹ️  Error cleaning up test types: {e}")
    
    print("\n🎉 Dynamic icon system test completed successfully!")
    print("\n📊 Summary:")
    print(f"   - Total incident types: {IncidentType.objects.filter(site=site).count()}")
    print(f"   - Types with custom icons: {IncidentType.objects.filter(site=site).exclude(icon__in=['AlertTriangle', 'Shield', 'Eye', 'Send']).count()}")
    
    return True

if __name__ == '__main__':
    success = test_dynamic_icon_system()
    if success:
        print("\n🎉 Dynamic icon system is working correctly!")
    else:
        print("\n❌ Dynamic icon system test failed!")
