from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
from api.models import NotificationEmail
from api.utils import send_incident_notification
from api.models import Site, Incident
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Test email functionality without breaking the application'

    def add_arguments(self, parser):
        parser.add_argument(
            '--test-smtp',
            action='store_true',
            help='Test SMTP connection (if configured)',
        )
        parser.add_argument(
            '--test-notification',
            action='store_true',
            help='Test incident notification email',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting email functionality test...'))
        
        if options['test_smtp']:
            self.test_smtp_connection()
        
        if options['test_notification']:
            self.test_notification_email()
        
        if not options['test_smtp'] and not options['test_notification']:
            self.stdout.write(self.style.WARNING('No test specified. Use --test-smtp or --test-notification'))
            self.stdout.write('Available tests:')
            self.stdout.write('  --test-smtp: Test SMTP connection')
            self.stdout.write('  --test-notification: Test incident notification email')

    def test_smtp_connection(self):
        """Test SMTP connection if configured"""
        self.stdout.write('Testing SMTP connection...')
        
        try:
            # Try to send a test email
            send_mail(
                subject='Test Email - Hexa Climate Safety System',
                message='This is a test email to verify SMTP configuration.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=['test@example.com'],
                fail_silently=True,
            )
            self.stdout.write(self.style.SUCCESS('✓ SMTP test completed (check console for output)'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ SMTP test failed: {e}'))
            self.stdout.write(self.style.WARNING('This is expected if SMTP is not configured yet'))

    def test_notification_email(self):
        """Test incident notification email"""
        self.stdout.write('Testing incident notification email...')
        
        # Get notification emails from database
        notification_emails = list(NotificationEmail.objects.values_list('email', flat=True))
        
        if not notification_emails:
            self.stdout.write(self.style.WARNING('No notification emails configured in database'))
            self.stdout.write('Add some emails via admin interface or frontend')
            return
        
        # Get a sample site and create a test incident
        try:
            site = Site.objects.first()
            if not site:
                self.stdout.write(self.style.ERROR('No sites found. Create a site first.'))
                return
            
            # Create a test incident
            test_incident = Incident.objects.create(
                site=site,
                incident_type='general_feedback',
                description='This is a test incident for email notification testing.',
                is_anonymous=True,
                criticality='low'
            )
            
            # Test the notification function
            result = send_incident_notification(test_incident)
            
            if result:
                self.stdout.write(self.style.SUCCESS('✓ Notification email test completed'))
                self.stdout.write(f'  Recipients: {len(notification_emails)}')
                self.stdout.write(f'  Emails: {", ".join(notification_emails)}')
            else:
                self.stdout.write(self.style.ERROR('✗ Notification email test failed'))
            
            # Clean up test incident
            test_incident.delete()
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Test failed: {e}'))
            self.stdout.write(self.style.WARNING('Email functionality will not break the main application')) 