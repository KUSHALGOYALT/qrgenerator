from django.contrib import admin
from django.utils.html import format_html
from .models import Site, EmergencyContact, Incident


@admin.register(Site)
class SiteAdmin(admin.ModelAdmin):
    list_display = ['name', 'address', 'created_at']
    search_fields = ['name', 'address']
    list_filter = ['created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(EmergencyContact)
class EmergencyContactAdmin(admin.ModelAdmin):
    list_display = ['name', 'designation', 'phone_number', 'site']
    search_fields = ['name', 'designation', 'phone_number']
    list_filter = ['site', 'created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ['incident_type', 'criticality', 'site', 'is_anonymous', 'created_at', 'image_preview']
    list_filter = ['incident_type', 'criticality', 'site', 'is_anonymous', 'created_at']
    search_fields = ['description', 'reporter_name']
    readonly_fields = ['id', 'created_at', 'updated_at', 'image_preview']
    fieldsets = (
        ('Basic Information', {
            'fields': ('site', 'incident_type', 'criticality', 'description', 'image', 'image_preview')
        }),
        ('Reporter Information', {
            'fields': ('is_anonymous', 'reporter_name', 'reporter_phone'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 100px; max-width: 100px;" />',
                obj.image.url
            )
        return "No image"
    image_preview.short_description = 'Image Preview' 