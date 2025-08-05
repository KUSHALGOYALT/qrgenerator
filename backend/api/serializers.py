from rest_framework import serializers
from .models import Site, EmergencyContact, Incident


class SiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Site
        fields = ['id', 'name', 'address', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class EmergencyContactSerializer(serializers.ModelSerializer):
    site_name = serializers.CharField(source='site.name', read_only=True)

    class Meta:
        model = EmergencyContact
        fields = ['id', 'site', 'site_name', 'name', 'designation', 'phone_number', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class IncidentSerializer(serializers.ModelSerializer):
    site_name = serializers.CharField(source='site.name', read_only=True)
    incident_type_display = serializers.CharField(source='get_incident_type_display', read_only=True)
    criticality_display = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Incident
        fields = [
            'id', 'site', 'site_name', 'incident_type', 'incident_type_display',
            'criticality', 'criticality_display', 'description', 'image',
            'is_anonymous', 'reporter_name', 'reporter_phone',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_criticality_display(self, obj):
        """Custom method to handle null criticality values"""
        if obj.criticality:
            return obj.get_criticality_display()
        return None

    def get_image(self, obj):
        """Return relative URL for image"""
        if obj.image:
            return f'/media/{obj.image}'
        return None

    def validate(self, data):
        """
        Validate that if is_anonymous is False, reporter_name and reporter_phone are provided
        """
        if not data.get('is_anonymous', True):
            if not data.get('reporter_name'):
                raise serializers.ValidationError("Reporter name is required when not anonymous.")
            if not data.get('reporter_phone'):
                raise serializers.ValidationError("Reporter phone is required when not anonymous.")
        return data


class SiteDetailSerializer(SiteSerializer):
    emergency_contacts = EmergencyContactSerializer(many=True, read_only=True)
    incidents = IncidentSerializer(many=True, read_only=True)

    class Meta(SiteSerializer.Meta):
        fields = SiteSerializer.Meta.fields + ['emergency_contacts', 'incidents'] 