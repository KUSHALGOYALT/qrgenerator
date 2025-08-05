# Email Notification Setup

This guide explains how to configure email notifications for safety incidents.

## Configuration

### 1. Email Settings

Update the email settings in `hexaclimate/settings.py`:

```python
# Email Configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'  # Change to your email provider
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'  # Your email address
EMAIL_HOST_PASSWORD = 'your-app-password'  # Your app password
```

### 2. Notification Recipients

The following email addresses will receive incident notifications:

- nirbhay.dwivedi@hex
- Anil.choudhary@hex  
- Umesh.kothe@hex

You can modify this list in `settings.py`:

```python
INCIDENT_NOTIFICATION_EMAILS = [
    'nirbhay.dwivedi@hex',
    'Anil.choudhary@hex',
    'Umesh.kothe@hex'
]
```

## Email Provider Setup

### Gmail Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use this app password in `EMAIL_HOST_PASSWORD`

### Other Email Providers

For other providers, update these settings:

```python
EMAIL_HOST = 'smtp.your-provider.com'
EMAIL_PORT = 587  # or 465 for SSL
EMAIL_USE_TLS = True  # or False for SSL
```

## Testing

Run the test script to verify email functionality:

```bash
python test_email.py
```

## Email Content

Each incident notification includes:

- Site name
- Incident type
- Criticality level (if applicable)
- Description
- Reporter information (anonymous or named)
- Date and time
- Image attachment status

## Troubleshooting

1. **Authentication Error**: Check your email credentials and app password
2. **Connection Error**: Verify SMTP settings and network connectivity
3. **Template Error**: Ensure templates directory is properly configured

## Security Notes

- Store email credentials securely (consider environment variables)
- Use app passwords instead of regular passwords
- Consider using a dedicated email account for notifications 