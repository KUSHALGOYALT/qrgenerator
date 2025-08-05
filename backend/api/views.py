from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import qrcode
import io
import base64

from .models import Site, EmergencyContact, Incident
from .serializers import (
    SiteSerializer, SiteDetailSerializer,
    EmergencyContactSerializer,
    IncidentSerializer
)
from .utils import send_incident_notification_simple


class SiteViewSet(viewsets.ModelViewSet):
    queryset = Site.objects.all()
    serializer_class = SiteSerializer
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SiteDetailSerializer
        return SiteSerializer

    @action(detail=True, methods=['get'])
    def contacts(self, request, pk=None):
        """Get emergency contacts for a specific site"""
        site = self.get_object()
        contacts = list(site.emergency_contacts.all())
        
        # Add only 4 essential national helpline numbers for every site
        national_contacts = [
            {
                'id': 'national-police',
                'site': site.id,
                'site_name': 'National Emergency',
                'name': 'Police',
                'designation': 'National Emergency',
                'phone_number': '100',
                'created_at': None,
                'updated_at': None
            },
            {
                'id': 'national-ambulance',
                'site': site.id,
                'site_name': 'National Emergency',
                'name': 'Ambulance',
                'designation': 'Medical Emergency',
                'phone_number': '102',
                'created_at': None,
                'updated_at': None
            },
            {
                'id': 'national-fire',
                'site': site.id,
                'site_name': 'National Emergency',
                'name': 'Fire Brigade',
                'designation': 'Fire Emergency',
                'phone_number': '101',
                'created_at': None,
                'updated_at': None
            },
            {
                'id': 'national-child',
                'site': site.id,
                'site_name': 'National Emergency',
                'name': 'Child Helpline',
                'designation': 'Child Protection',
                'phone_number': '1098',
                'created_at': None,
                'updated_at': None
            },
        ]
        
        # Serialize the actual EmergencyContact model instances
        contacts_serializer = EmergencyContactSerializer(contacts, many=True)
        contacts_data = contacts_serializer.data
        
        # Combine national contacts with serialized site-specific contacts
        all_contacts = national_contacts + contacts_data
        return Response(all_contacts)

    @action(detail=True, methods=['get'])
    def incidents(self, request, pk=None):
        """Get incidents for a specific site"""
        site = self.get_object()
        incidents = site.incidents.all()
        serializer = IncidentSerializer(incidents, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def qr_code(self, request, pk=None):
        """Generate QR code for a specific site"""
        site = self.get_object()
        
        # Generate the public URL for this site
        # In production, this would be your actual domain
        base_url = request.build_absolute_uri('/').rstrip('/')
        public_url = f"{base_url}/public/{site.id}/"
        
        # Create QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(public_url)
        qr.make(fit=True)
        
        # Create QR code image
        qr_img = qr.make_image(fill_color="black", back_color="white")
        
        # Create a composite image with header, QR code, and description
        from PIL import Image, ImageDraw, ImageFont
        
        # Calculate dimensions
        qr_width, qr_height = qr_img.size
        header_height = 60
        description_height = 40
        padding = 20
        
        # Create the main image
        total_width = qr_width + 2 * padding
        total_height = header_height + qr_height + description_height + 3 * padding
        composite_img = Image.new('RGB', (total_width, total_height), 'white')
        
        # Add header with site name
        draw = ImageDraw.Draw(composite_img)
        
        # Try different font paths for cross-platform compatibility
        font_large = None
        font_small = None
        
        font_paths = [
            "/System/Library/Fonts/Arial.ttf",  # macOS
            "/System/Library/Fonts/Helvetica.ttc",  # macOS alternative
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",  # Linux
            "C:/Windows/Fonts/arial.ttf",  # Windows
        ]
        
        for font_path in font_paths:
            try:
                font_large = ImageFont.truetype(font_path, 24)
                font_small = ImageFont.truetype(font_path, 16)
                break
            except:
                continue
        
        # Fallback to default font if no system fonts found
        if font_large is None:
            font_large = ImageFont.load_default()
            font_small = ImageFont.load_default()
        
        # Draw header
        header_text = f"Site: {site.name}"
        header_bbox = draw.textbbox((0, 0), header_text, font=font_large)
        header_width = header_bbox[2] - header_bbox[0]
        header_x = (total_width - header_width) // 2
        draw.text((header_x, padding), header_text, fill='black', font=font_large)
        
        # Add QR code
        qr_x = (total_width - qr_width) // 2
        qr_y = header_height + padding
        composite_img.paste(qr_img, (qr_x, qr_y))
        
        # Add description
        description_text = "Scan to access safety feedback form"
        desc_bbox = draw.textbbox((0, 0), description_text, font=font_small)
        desc_width = desc_bbox[2] - desc_bbox[0]
        desc_x = (total_width - desc_width) // 2
        desc_y = qr_y + qr_height + padding
        draw.text((desc_x, desc_y), description_text, fill='black', font=font_small)
        
        # Convert to base64
        buffer = io.BytesIO()
        composite_img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return Response({
            'qr_code': img_str,
            'public_url': public_url,
            'site_name': site.name,
            'description': 'Scan to access safety feedback form'
        })


class EmergencyContactViewSet(viewsets.ModelViewSet):
    queryset = EmergencyContact.objects.all()
    serializer_class = EmergencyContactSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = EmergencyContact.objects.all()
        site_id = self.request.query_params.get('site', None)
        if site_id is not None:
            queryset = queryset.filter(site_id=site_id)
        return queryset


class IncidentViewSet(viewsets.ModelViewSet):
    queryset = Incident.objects.all()
    serializer_class = IncidentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Incident.objects.all()
        site_id = self.request.query_params.get('site', None)
        incident_type = self.request.query_params.get('type', None)
        
        if site_id is not None:
            queryset = queryset.filter(site_id=site_id)
        if incident_type is not None:
            queryset = queryset.filter(incident_type=incident_type)
            
        return queryset

    def create(self, request, *args, **kwargs):
        """Override create to handle file uploads properly and send email notifications"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        incident = serializer.save()
        
        # Send email notification
        try:
            send_incident_notification_simple(incident)
        except Exception as e:
            print(f"Failed to send email notification: {e}")
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


@method_decorator(csrf_exempt, name='dispatch')
def public_site_view(request, site_id):
    """Public view for site feedback form"""
    try:
        site = get_object_or_404(Site, id=site_id)
        return HttpResponse(f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>{site.name} - Safety Feedback</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <script>
                window.location.href = 'http://localhost:3000/public/{site_id}/';
            </script>
        </head>
        <body>
            <p>Redirecting to feedback form...</p>
        </body>
        </html>
        """)
    except Site.DoesNotExist:
        return HttpResponse("Site not found", status=404) 