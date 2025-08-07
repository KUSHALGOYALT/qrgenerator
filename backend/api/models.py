from django.db import models
from django.core.validators import RegexValidator
import uuid


class Site(models.Model):
    """Model for sites/locations"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class NotificationEmail(models.Model):
    """Simple model for notification emails"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email

    class Meta:
        ordering = ['email']


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


class IncidentImage(models.Model):
    """Model for incident images"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    incident = models.ForeignKey('Incident', on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='incident_images/')
    caption = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.incident}"

    class Meta:
        ordering = ['-created_at']


class IncidentType(models.Model):
    """Model for site-specific incident types"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='incident_types')
    name = models.CharField(max_length=100)
    display_name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    requires_criticality = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.display_name} ({self.site.name})"

    class Meta:
        ordering = ['order', 'display_name']
        unique_together = ['site', 'name']


class Incident(models.Model):
    """Model for incident reports"""
    CRITICALITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='incidents')
    incident_type = models.ForeignKey(IncidentType, on_delete=models.CASCADE, related_name='incidents')
    criticality = models.CharField(max_length=10, choices=CRITICALITY_LEVELS, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    description = models.TextField(max_length=2000)
    
    # Anonymous reporting fields
    is_anonymous = models.BooleanField(default=False)
    reporter_name = models.CharField(max_length=100, blank=True, null=True)
    reporter_phone = models.CharField(max_length=17, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Set default criticality for incident types that don't require criticality
        if not self.incident_type.requires_criticality and not self.criticality:
            self.criticality = 'low'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.incident_type.display_name} - {self.site.name} ({self.created_at.strftime('%Y-%m-%d')})"

    @property
    def image_count(self):
        """Return the number of images for this incident"""
        return self.images.count()

    class Meta:
        ordering = ['-created_at'] 