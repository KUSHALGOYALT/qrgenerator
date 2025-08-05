from django.db import migrations
import uuid

def update_to_indian_helplines(apps, schema_editor):
    EmergencyContact = apps.get_model('api', 'EmergencyContact')
    Site = apps.get_model('api', 'Site')
    
    # Delete old US numbers
    EmergencyContact.objects.filter(
        phone_number__in=['911', '1-800-222-1222', '988', '1-800-799-7233', '1-800-422-4453']
    ).delete()
    
    # Get the first site
    sites = Site.objects.all()
    if sites.exists():
        default_site = sites.first()
        
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
        
        for contact_data in indian_contacts:
            EmergencyContact.objects.get_or_create(
                site=default_site,
                phone_number=contact_data['phone_number'],
                defaults={
                    'id': uuid.uuid4(),
                    'name': contact_data['name'],
                    'designation': contact_data['designation'],
                }
            )

def reverse_update(apps, schema_editor):
    EmergencyContact = apps.get_model('api', 'EmergencyContact')
    EmergencyContact.objects.filter(
        phone_number__in=['100', '101', '102', '1091', '1098', '139', '1064', '14567']
    ).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_add_default_emergency_contacts'),
    ]

    operations = [
        migrations.RunPython(update_to_indian_helplines, reverse_update),
    ] 