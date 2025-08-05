from django.db import migrations

def remove_old_national_contacts(apps, schema_editor):
    """Remove old national emergency contacts that are no longer needed"""
    EmergencyContact = apps.get_model('api', 'EmergencyContact')
    
    # Remove old national contacts that are not in our new 4-number system
    old_national_numbers = ['1091', '139', '1064', '14567']
    EmergencyContact.objects.filter(phone_number__in=old_national_numbers).delete()

def add_back_old_national_contacts(apps, schema_editor):
    """Add back the old national contacts (for rollback)"""
    Site = apps.get_model('api', 'Site')
    EmergencyContact = apps.get_model('api', 'EmergencyContact')
    import uuid
    
    old_contacts = [
        {'name': 'Women Helpline', 'designation': 'Women Safety', 'phone_number': '1091'},
        {'name': 'Railway Helpline', 'designation': 'Railway Emergency', 'phone_number': '139'},
        {'name': 'Anti Corruption', 'designation': 'Anti Corruption Bureau', 'phone_number': '1064'},
        {'name': 'Senior Citizen Helpline', 'designation': 'Senior Citizen Support', 'phone_number': '14567'},
    ]
    
    for site in Site.objects.all():
        for contact_data in old_contacts:
            EmergencyContact.objects.get_or_create(
                site=site,
                phone_number=contact_data['phone_number'],
                defaults={
                    'id': uuid.uuid4(),
                    'name': contact_data['name'],
                    'designation': contact_data['designation'],
                }
            )

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_add_helplines_to_all_sites'),
    ]

    operations = [
        migrations.RunPython(remove_old_national_contacts, add_back_old_national_contacts),
    ] 