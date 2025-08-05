from django.db import migrations
import uuid

def add_helplines_to_all_sites(apps, schema_editor):
    Site = apps.get_model('api', 'Site')
    EmergencyContact = apps.get_model('api', 'EmergencyContact')
    
    # Indian emergency numbers
    indian_contacts = [
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
    
    # Add helpline numbers to all sites
    for site in Site.objects.all():
        for contact_data in indian_contacts:
            EmergencyContact.objects.get_or_create(
                site=site,
                phone_number=contact_data['phone_number'],
                defaults={
                    'id': uuid.uuid4(),
                    'name': contact_data['name'],
                    'designation': contact_data['designation'],
                }
            )

def remove_helplines_from_all_sites(apps, schema_editor):
    EmergencyContact = apps.get_model('api', 'EmergencyContact')
    EmergencyContact.objects.filter(
        phone_number__in=['100', '101', '102', '1091', '1098', '139', '1064', '14567']
    ).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_update_to_indian_helplines'),
    ]

    operations = [
        migrations.RunPython(add_helplines_to_all_sites, remove_helplines_from_all_sites),
    ] 