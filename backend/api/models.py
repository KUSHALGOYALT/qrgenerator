from django.db import models
from django.core.validators import RegexValidator
import uuid


class Site(models.Model):
    """Model for managing sites"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class EmergencyContact(models.Model):
    """Model for emergency contacts per site"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='emergency_contacts')
    name = models.CharField(max_length=100)
    designation = models.CharField(max_length=100)
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    phone_number = models.CharField(validators=[phone_regex], max_length=17)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.designation} ({self.site.name})"

    class Meta:
        ordering = ['name']


class Incident(models.Model):
    """Model for incident reports"""
    INCIDENT_TYPES = [
        ('unsafe_conditions', 'Unsafe Conditions'),
        ('unsafe_actions', 'Unsafe Actions'),
        ('near_miss', 'Near Miss'),
        ('general_feedback', 'General Feedback'),
    ]

    CRITICALITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='incidents')
    incident_type = models.CharField(max_length=20, choices=INCIDENT_TYPES)
    criticality = models.CharField(max_length=10, choices=CRITICALITY_LEVELS, blank=True, null=True)
    description = models.TextField()
    image = models.ImageField(upload_to='incident_images/', blank=True, null=True)
    
    # Anonymous reporting fields
    is_anonymous = models.BooleanField(default=True)
    reporter_name = models.CharField(max_length=100, blank=True, null=True)
    reporter_phone = models.CharField(max_length=17, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Set default criticality for general feedback
        if self.incident_type == 'general_feedback' and not self.criticality:
            self.criticality = 'low'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.get_incident_type_display()} - {self.site.name} ({self.created_at.strftime('%Y-%m-%d')})"

    class Meta:
        ordering = ['-created_at'] 