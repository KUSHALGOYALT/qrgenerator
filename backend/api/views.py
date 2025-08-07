from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
import qrcode
import io
import base64

from .models import Site, EmergencyContact, Incident, IncidentImage, NotificationEmail, IncidentType
from .serializers import (
    SiteSerializer, SiteDetailSerializer,
    EmergencyContactSerializer,
    IncidentSerializer, NotificationEmailSerializer, IncidentTypeSerializer
)
from .utils import send_incident_notification


class AuthViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': 'Username and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=username, password=password)
        
        if user is not None:
            login(request, user)
            return Response({
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            })
        else:
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

    @action(detail=False, methods=['post'])
    def logout(self, request):
        logout(request)
        return Response({'message': 'Logout successful'})

    @action(detail=False, methods=['get'])
    def check_auth(self, request):
        if request.user.is_authenticated:
            return Response({
                'authenticated': True,
                'user': {
                    'id': request.user.id,
                    'username': request.user.username,
                    'email': request.user.email,
                    'first_name': request.user.first_name,
                    'last_name': request.user.last_name
                }
            })
        else:
            return Response({'authenticated': False})


class SiteViewSet(viewsets.ModelViewSet):
    queryset = Site.objects.all()
    serializer_class = SiteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        """Allow public access to retrieve and public_contacts actions"""
        if self.action in ['retrieve', 'public_contacts']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SiteDetailSerializer
        return SiteSerializer

    def create_default_incident_types(self, site):
        """Create default incident types for a new site"""
        default_types = [
            {
                'name': 'unsafe_conditions',
                'display_name': 'Unsafe Conditions',
                'description': 'Report unsafe conditions or hazards in the workplace',
                'icon': 'AlertTriangle',
                'color': 'bg-red-500',
                'requires_criticality': True,
                'order': 1
            },
            {
                'name': 'unsafe_actions',
                'display_name': 'Unsafe Actions',
                'description': 'Report unsafe actions or behaviors',
                'icon': 'Shield',
                'color': 'bg-orange-500',
                'requires_criticality': True,
                'order': 2
            },
            {
                'name': 'near_miss',
                'display_name': 'Near Miss',
                'description': 'Report near miss incidents',
                'icon': 'Eye',
                'color': 'bg-yellow-500',
                'requires_criticality': True,
                'order': 3
            },
            {
                'name': 'general_feedback',
                'display_name': 'General Feedback',
                'description': 'General feedback or suggestions',
                'icon': 'Send',
                'color': 'bg-blue-500',
                'requires_criticality': False,
                'order': 4
            }
        ]
        
        for incident_type_data in default_types:
            IncidentType.objects.get_or_create(
                site=site,
                name=incident_type_data['name'],
                defaults={
                    'display_name': incident_type_data['display_name'],
                    'description': incident_type_data['description'],
                    'icon': incident_type_data['icon'],
                    'color': incident_type_data['color'],
                    'requires_criticality': incident_type_data['requires_criticality'],
                    'order': incident_type_data['order']
                }
            )

    def perform_create(self, serializer):
        """Override to create default incident types after site creation"""
        site = serializer.save()
        self.create_default_incident_types(site)
        return site

    @action(detail=True, methods=['get'])
    def contacts(self, request, pk=None):
        site = self.get_object()
        
        # Get site-specific contacts only
        site_contacts = EmergencyContact.objects.filter(site=site)
        site_contacts_data = EmergencyContactSerializer(site_contacts, many=True).data
        
        return Response(site_contacts_data)

    @action(detail=True, methods=['get'])
    def public_contacts(self, request, pk=None):
        site = self.get_object()
        
        # Get site-specific contacts
        site_contacts = EmergencyContact.objects.filter(site=site)
        site_contacts_data = EmergencyContactSerializer(site_contacts, many=True).data
        
        # Add national emergency contacts for public view
        national_contacts = [
            {
                'id': 'national-police',
                'name': 'Police',
                'designation': 'Emergency',
                'phone_number': '100',
                'site_name': 'National Emergency'
            },
            {
                'id': 'national-ambulance',
                'name': 'Ambulance',
                'designation': 'Emergency',
                'phone_number': '102',
                'site_name': 'National Emergency'
            },
            {
                'id': 'national-fire',
                'name': 'Fire Brigade',
                'designation': 'Emergency',
                'phone_number': '101',
                'site_name': 'National Emergency'
            },
            {
                'id': 'national-child',
                'name': 'Child Helpline',
                'designation': 'Emergency',
                'phone_number': '1098',
                'site_name': 'National Emergency'
            }
        ]
        
        # Combine site contacts and national contacts
        all_contacts = site_contacts_data + national_contacts
        
        return Response(all_contacts)

    @action(detail=True, methods=['get'])
    def qr_code(self, request, pk=None):
        site = self.get_object()
        
        # Generate QR code URL - use production URL for hosted environment
        from django.conf import settings
        
        # Check if we're in production (not localhost)
        if 'localhost' in request.get_host() or '127.0.0.1' in request.get_host():
            # Development environment
            qr_url = f"{request.scheme}://{request.get_host()}/public/{site.id}/"
        else:
            # Production environment - use the configured production URL
            qr_url = f"{settings.PRODUCTION_URL}/public/{site.id}/"
        
        # Debug: Print the generated URL
        print(f"Generated QR URL for site {site.name} (ID: {site.id}): {qr_url}")
        
        # Create QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_url)
        qr.make(fit=True)
        
        # Create QR code image
        qr_image = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = io.BytesIO()
        qr_image.save(buffer, format='PNG')
        qr_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        # Create composite image with header
        from PIL import Image, ImageDraw, ImageFont
        import os
        
        # Create a composite image with logo on the left of site name, and description
        # Enhanced dimensions and spacing for long site names
        qr_size = 350
        header_height = 80  # Height for logo + site name row
        description_height = 60
        total_height = header_height + qr_size + description_height
        total_width = qr_size
        
        # Create the composite image
        composite = Image.new('RGB', (total_width, total_height), 'white')
        draw = ImageDraw.Draw(composite)
        
        # Try to use better fonts
        try:
            header_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 18)  # Smaller font for long names
            desc_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 16)
        except:
            try:
                header_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
                desc_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 16)
            except:
                header_font = ImageFont.load_default()
                desc_font = ImageFont.load_default()
        
        # Add logo image on the left side
        logo_size = 40  # Size of the logo (40x40 pixels)
        logo_x = 20  # 20px from left edge
        logo_y = (header_height - logo_size) // 2  # Center vertically in header area
        
        # Try to load logo image from static files
        logo_path = os.path.join(settings.BASE_DIR, 'static', 'images', 'logo.png')
        if os.path.exists(logo_path):
            try:
                logo_img = Image.open(logo_path)
                # Resize logo to fit
                logo_img = logo_img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
                # Paste logo onto composite image
                composite.paste(logo_img, (logo_x, logo_y))
                print(f"✅ Logo loaded from: {logo_path}")
            except Exception as e:
                print(f"⚠️  Error loading logo: {e}")
                # Fallback to text logo
                logo_text = "LOGO"
                logo_bbox = draw.textbbox((0, 0), logo_text, font=header_font)
                logo_width = logo_bbox[2] - logo_bbox[0]
                draw.text((logo_x, logo_y + 10), logo_text, fill='black', font=header_font)
        else:
            print(f"⚠️  Logo not found at: {logo_path}")
            # Fallback to text logo
            logo_text = "LOGO"
            logo_bbox = draw.textbbox((0, 0), logo_text, font=header_font)
            logo_width = logo_bbox[2] - logo_bbox[0]
            draw.text((logo_x, logo_y + 10), logo_text, fill='black', font=header_font)
        
        # Handle site name on the right side of the logo
        site_name = site.name
        site_bbox = draw.textbbox((0, 0), site_name, font=header_font)
        site_width = site_bbox[2] - site_bbox[0]
        
        # Calculate available space for site name (after logo + spacing)
        logo_end = logo_x + logo_size + 15  # 15px spacing between logo and site name
        available_width = total_width - logo_end - 20  # 20px right margin
        
        # If site name is too long, truncate it with ellipsis
        if site_width > available_width:
            # Try to fit as much as possible
            truncated_name = site_name
            while truncated_name and draw.textbbox((0, 0), truncated_name + "...", font=header_font)[2] > available_width:
                truncated_name = truncated_name[:-1]
            site_name = truncated_name + "..." if truncated_name else site_name[:10] + "..."
            site_bbox = draw.textbbox((0, 0), site_name, font=header_font)
            site_width = site_bbox[2] - site_bbox[0]
        
        # Position site name to the right of logo
        site_x = logo_end
        site_y = (header_height - site_bbox[3]) // 2  # Center vertically in header area
        draw.text((site_x, site_y), site_name, fill='black', font=header_font)
        
        # Add QR code centered
        qr_image_resized = qr_image.resize((qr_size, qr_size))
        composite.paste(qr_image_resized, (0, header_height))
        
        # Center the description text
        description = "Scan for Site info and Reporting Issues"
        desc_bbox = draw.textbbox((0, 0), description, font=desc_font)
        desc_width = desc_bbox[2] - desc_bbox[0]
        desc_x = (total_width - desc_width) // 2
        draw.text((desc_x, header_height + qr_size + 15), description, fill='black', font=desc_font)
        
        # Convert composite to base64
        buffer = io.BytesIO()
        composite.save(buffer, format='PNG')
        composite_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return Response({
            'qr_code': f"data:image/png;base64,{composite_base64}",
            'url': qr_url,
            'site_name': site.name
        })


class EmergencyContactViewSet(viewsets.ModelViewSet):
    queryset = EmergencyContact.objects.all()
    serializer_class = EmergencyContactSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        """Allow public access to list action for emergency contacts"""
        if self.action in ['list']:
            return [AllowAny()]
        return [IsAuthenticated()]


class IncidentViewSet(viewsets.ModelViewSet):
    queryset = Incident.objects.all()
    serializer_class = IncidentSerializer
    permission_classes = [AllowAny]  # Allow public submission

    def get_queryset(self):
        queryset = Incident.objects.all().order_by('-created_at')
        
        # Filter by site if provided
        site_id = self.request.query_params.get('site', None)
        if site_id:
            queryset = queryset.filter(site_id=site_id)
        
        return queryset

    def create(self, request, *args, **kwargs):
        # Handle image uploads
        images = request.FILES.getlist('images')
        
        # Get the incident type object based on name and site
        incident_type_name = request.data.get('incident_type')
        site_id = request.data.get('site')
        
        if not incident_type_name or not site_id:
            return Response(
                {'error': 'incident_type and site are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            incident_type = IncidentType.objects.get(site_id=site_id, name=incident_type_name)
        except IncidentType.DoesNotExist:
            return Response(
                {'error': f'Incident type "{incident_type_name}" not found for this site'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create the incident with the incident type object
        data = request.data.copy()
        data['incident_type'] = incident_type.id
        
        # Create the incident
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        incident = serializer.save()
        
        # Handle image uploads
        for image in images:
            IncidentImage.objects.create(incident=incident, image=image)
        
        # Send notification email - this will not break the application if it fails
        email_sent = send_incident_notification(incident)
        
        # Log the result but don't let email failures affect the response
        if email_sent:
            print(f"Email notification sent for incident {incident.id}")
        else:
            print(f"Email notification failed for incident {incident.id} - but incident was saved successfully")
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Override update to handle partial updates properly"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        # Debug logging
        print(f"Update request data: {request.data}")
        print(f"Partial update: {partial}")
        
        serializer.is_valid(raise_exception=True)
        
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        """Handle PATCH requests for partial updates"""
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


class NotificationEmailViewSet(viewsets.ModelViewSet):
    queryset = NotificationEmail.objects.all()
    serializer_class = NotificationEmailSerializer
    permission_classes = [IsAuthenticated]


class IncidentTypeViewSet(viewsets.ModelViewSet):
    queryset = IncidentType.objects.all()
    serializer_class = IncidentTypeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = IncidentType.objects.all().order_by('order', 'display_name')
        
        # Filter by site if provided
        site_id = self.request.query_params.get('site', None)
        if site_id:
            queryset = queryset.filter(site_id=site_id)
        
        return queryset


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
                       window.location.href = 'https://hse.hexaclimate.com/public/{site_id}/';
                   </script>
        </head>
        <body>
            <p>Redirecting to feedback form...</p>
        </body>
        </html>
        """)
    except Site.DoesNotExist:
        return HttpResponse("Site not found", status=404) 