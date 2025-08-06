from django.contrib import admin
from django.utils.html import format_html
from .models import Site, EmergencyContact, Incident, IncidentImage, NotificationEmail


class IncidentImageInline(admin.TabularInline):
    model = IncidentImage
    extra = 1
    fields = ['image', 'caption']


@admin.register(Site)
class SiteAdmin(admin.ModelAdmin):
    list_display = ['name', 'address', 'created_at']
    search_fields = ['name', 'address']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(NotificationEmail)
class NotificationEmailAdmin(admin.ModelAdmin):
    list_display = ['email', 'created_at']
    search_fields = ['email']
    readonly_fields = ['id', 'created_at']
    ordering = ['email']


@admin.register(EmergencyContact)
class EmergencyContactAdmin(admin.ModelAdmin):
    list_display = ['name', 'designation', 'phone_number', 'site']
    list_filter = ['site', 'created_at']
    search_fields = ['name', 'designation', 'phone_number']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ['incident_type', 'criticality', 'status', 'site', 'is_anonymous', 'image_count', 'created_at']
    list_filter = ['incident_type', 'criticality', 'status', 'site', 'is_anonymous', 'created_at']
    search_fields = ['description', 'reporter_name']
    readonly_fields = ['id', 'created_at', 'updated_at', 'image_count']
    inlines = [IncidentImageInline]
    fieldsets = (
        ('Basic Information', {
            'fields': ('site', 'incident_type', 'criticality', 'status', 'description')
        }),
        ('Reporter Information', {
            'fields': ('is_anonymous', 'reporter_name', 'reporter_phone'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at', 'image_count'),
            'classes': ('collapse',)
        }),
    )


@admin.register(IncidentImage)
class IncidentImageAdmin(admin.ModelAdmin):
    list_display = ['incident', 'image_preview', 'caption', 'created_at']
    list_filter = ['created_at']
    search_fields = ['incident__description', 'caption']
    readonly_fields = ['id', 'created_at', 'image_preview']
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 50px; max-width: 50px;" />',
                obj.image.url
            )
        return "No image"
    image_preview.short_description = 'Preview' 