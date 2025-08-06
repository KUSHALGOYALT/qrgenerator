from django.core.mail import send_mail
from django.conf import settings
from .models import NotificationEmail
import logging

# Set up logging for email errors
logger = logging.getLogger(__name__)

def send_incident_notification(incident):
    """
    Send simple email notification for new incidents to configured recipients
    This function is designed to fail gracefully and not break the main application
    """
    try:
        # Get notification emails from database
        notification_emails = list(NotificationEmail.objects.values_list('email', flat=True))
        
        if not notification_emails:
            logger.info("No notification emails configured in database - skipping email notification")
            return True  # Return True to indicate "success" (no emails to send)
        
        subject = f"New Safety Incident Report - {incident.get_incident_type_display()}"
        
        message = f"""
New safety incident reported:

Site: {incident.site.name}
Type: {incident.get_incident_type_display()}
Criticality: {incident.get_criticality_display() if incident.criticality else 'N/A'}
Description: {incident.description}
Reporter: {'Anonymous' if incident.is_anonymous else incident.reporter_name}
Date: {incident.created_at.strftime('%Y-%m-%d %H:%M:%S')}

This is an automated notification from the Hexa Climate Safety System.
        """
        
        # Use fail_silently=True to prevent email errors from breaking the application
        send_mail(
            subject=subject,
            message=message,
            from_email='safety@hexaclimate.com',
            recipient_list=notification_emails,
            fail_silently=True,  # Changed to True to prevent breaking the app
        )
        
        logger.info(f"Incident notification sent to {len(notification_emails)} recipients")
        return True
        
    except Exception as e:
        # Log the error but don't let it break the application
        logger.error(f"Email notification failed for incident {incident.id}: {str(e)}")
        logger.error("This error will not affect the incident submission process")
        return True  # Return True to indicate "success" even if email fails 