from django.core.mail import send_mail
from django.conf import settings
from .models import NotificationEmail

def send_incident_notification(incident):
    """
    Send simple email notification for new incidents to configured recipients
    """
    try:
        # Get notification emails from database
        notification_emails = list(NotificationEmail.objects.values_list('email', flat=True))
        
        if not notification_emails:
            print("No notification emails configured in database")
            return False
        
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
        
        send_mail(
            subject=subject,
            message=message,
            from_email='safety@hexaclimate.com',  # Use a default from email
            recipient_list=notification_emails,
            fail_silently=False,
        )
        
        print(f"Incident notification sent to {len(notification_emails)} recipients")
        return True
        
    except Exception as e:
        print(f"Error sending incident notification: {e}")
        return False 