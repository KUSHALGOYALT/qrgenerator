from django.db import migrations
import uuid

def add_default_contacts(apps, schema_editor):
    Site = apps.get_model('api', 'Site')
    EmergencyContact = apps.get_model('api', 'EmergencyContact')
    
    # Get the first site (or create one if none exists)
    sites = Site.objects.all()
    if sites.exists():
        default_site = sites.first()
        
        # National emergency numbers (India)
        default_contacts = [
            {
                'name': 'Police',
                'designation': 'National Emergency',
                'phone_number': '100',
            },
            {
                'name': 'Ambulance',
                'designation': 'Medical Emergency',
                'phone_number': '102',
            },
            {
                'name': 'Fire Department',
                'designation': 'Fire Emergency',
                'phone_number': '101',
            },
            {
                'name': 'Women Helpline',
                'designation': 'Women Safety',
                'phone_number': '1091',
            },
            {
                'name': 'Child Helpline',
                'designation': 'Child Protection',
                'phone_number': '1098',
            },
            {
                'name': 'Senior Citizen Helpline',
                'designation': 'Senior Citizen Support',
                'phone_number': '14567',
            },
            {
                'name': 'Railway Helpline',
                'designation': 'Railway Emergency',
                'phone_number': '139',
            },
            {
                'name': 'Anti Corruption',
                'designation': 'Anti Corruption Bureau',
                'phone_number': '1064',
            },
        ]
        
        for contact_data in default_contacts:
            EmergencyContact.objects.get_or_create(
                site=default_site,
                phone_number=contact_data['phone_number'],
                defaults={
                    'id': uuid.uuid4(),
                    'name': contact_data['name'],
                    'designation': contact_data['designation'],
                }
            )

def remove_default_contacts(apps, schema_editor):
    EmergencyContact = apps.get_model('api', 'EmergencyContact')
    EmergencyContact.objects.filter(
        phone_number__in=['100', '101', '102', '1091', '1098', '139', '1064', '14567']
    ).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(add_default_contacts, remove_default_contacts),
    ] 