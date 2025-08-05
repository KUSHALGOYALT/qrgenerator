from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import os

def send_incident_notification(incident):
    """
    Send email notification for new incidents to all configured recipients
    """
    try:
        # Get notification emails from settings
        notification_emails = getattr(settings, 'INCIDENT_NOTIFICATION_EMAILS', [])
        
        if not notification_emails:
            print("No notification emails configured")
            return False
        
        # Prepare email content
        subject = f"New Safety Incident Report - {incident.get_incident_type_display()}"
        
        # Create HTML content
        html_content = render_to_string('emails/incident_notification.html', {
            'incident': incident,
            'site': incident.site,
        })
        
        # Create plain text content
        text_content = strip_tags(html_content)
        
        # Send email to all recipients
        send_mail(
            subject=subject,
            message=text_content,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=notification_emails,
            html_message=html_content,
            fail_silently=False,
        )
        
        print(f"Incident notification sent to {len(notification_emails)} recipients")
        return True
        
    except Exception as e:
        print(f"Error sending incident notification: {e}")
        return False

def send_incident_notification_simple(incident):
    """
    Simple email notification without HTML template
    """
    try:
        notification_emails = getattr(settings, 'INCIDENT_NOTIFICATION_EMAILS', [])
        
        if not notification_emails:
            print("No notification emails configured")
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
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=notification_emails,
            fail_silently=False,
        )
        
        print(f"Incident notification sent to {len(notification_emails)} recipients")
        return True
        
    except Exception as e:
        print(f"Error sending incident notification: {e}")
        return False 