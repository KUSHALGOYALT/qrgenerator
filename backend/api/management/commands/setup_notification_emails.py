from django.core.management.base import BaseCommand
from api.models import NotificationEmail


class Command(BaseCommand):
    help = 'Set up initial notification emails'

    def handle(self, *args, **options):
        # Default notification emails
        default_emails = [
            {
                'email': 'nirbhay.dwivedi@hex',
                'name': 'Nirbhay Dwivedi'
            },
            {
                'email': 'Anil.choudhary@hex',
                'name': 'Anil Choudhary'
            },
            {
                'email': 'Umesh.kothe@hex',
                'name': 'Umesh Kothe'
            }
        ]

        created_count = 0
        for email_data in default_emails:
            email, created = NotificationEmail.objects.get_or_create(
                email=email_data['email'],
                defaults={
                    'name': email_data['name'],
                    'is_active': True
                }
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created notification email: {email.email}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Notification email already exists: {email.email}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully set up {created_count} notification emails')
        ) 