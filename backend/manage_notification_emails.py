#!/usr/bin/env python
"""
Script to manage notification emails
Run this with: python manage_notification_emails.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hexaclimate.settings')
django.setup()

from api.models import NotificationEmail


def list_notification_emails():
    """List all notification emails"""
    print("\n=== Current Notification Emails ===")
    emails = NotificationEmail.objects.all().order_by('email')
    
    if not emails:
        print("No notification emails configured.")
        return
    
    for email in emails:
        status = "✅ ACTIVE" if email.is_active else "❌ INACTIVE"
        print(f"{email.email} ({email.name or 'Unnamed'}) - {status}")


def add_notification_email(email, name=None):
    """Add a new notification email"""
    try:
        notification_email, created = NotificationEmail.objects.get_or_create(
            email=email,
            defaults={
                'name': name or '',
                'is_active': True
            }
        )
        
        if created:
            print(f"✅ Added notification email: {email}")
        else:
            print(f"⚠️  Notification email already exists: {email}")
            
    except Exception as e:
        print(f"❌ Error adding notification email: {e}")


def remove_notification_email(email):
    """Remove a notification email"""
    try:
        notification_email = NotificationEmail.objects.get(email=email)
        notification_email.delete()
        print(f"✅ Removed notification email: {email}")
    except NotificationEmail.DoesNotExist:
        print(f"❌ Notification email not found: {email}")
    except Exception as e:
        print(f"❌ Error removing notification email: {e}")


def toggle_notification_email(email):
    """Toggle the active status of a notification email"""
    try:
        notification_email = NotificationEmail.objects.get(email=email)
        notification_email.is_active = not notification_email.is_active
        notification_email.save()
        status = "ACTIVE" if notification_email.is_active else "INACTIVE"
        print(f"✅ Toggled {email} to {status}")
    except NotificationEmail.DoesNotExist:
        print(f"❌ Notification email not found: {email}")
    except Exception as e:
        print(f"❌ Error toggling notification email: {e}")


def main():
    """Main function to demonstrate usage"""
    print("=== Notification Email Management ===")
    
    # List current emails
    list_notification_emails()
    
    # Example operations (uncomment to use)
    # add_notification_email("new.email@example.com", "New User")
    # toggle_notification_email("nirbhay.dwivedi@hex")
    # remove_notification_email("old.email@example.com")
    
    print("\n=== Usage Examples ===")
    print("To add an email: add_notification_email('email@example.com', 'Name')")
    print("To toggle status: toggle_notification_email('email@example.com')")
    print("To remove email: remove_notification_email('email@example.com')")
    print("\nOr use Django Admin at: http://localhost:8000/admin/")


if __name__ == "__main__":
    main() 