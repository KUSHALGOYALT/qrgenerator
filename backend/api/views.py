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

from .models import Site, EmergencyContact, Incident, IncidentImage, NotificationEmail
from .serializers import (
    SiteSerializer, SiteDetailSerializer,
    EmergencyContactSerializer,
    IncidentSerializer, NotificationEmailSerializer
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

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SiteDetailSerializer
        return SiteSerializer

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
        
        # Generate QR code URL
        qr_url = f"{request.scheme}://{request.get_host()}/hex/public/{site.id}/"
        
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
        
        # Create a composite image with site name header
        # Enhanced dimensions and spacing
        qr_size = 350
        header_height = 80
        description_height = 60
        total_height = header_height + qr_size + description_height
        total_width = qr_size
        
        # Create the composite image
        composite = Image.new('RGB', (total_width, total_height), 'white')
        draw = ImageDraw.Draw(composite)
        
        # Try to use larger, better fonts
        try:
            header_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 24)
            desc_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 18)
        except:
            try:
                header_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
                desc_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
            except:
                header_font = ImageFont.load_default()
                desc_font = ImageFont.load_default()
        
        # Center the header text
        header_text = f"Site: {site.name}"
        header_bbox = draw.textbbox((0, 0), header_text, font=header_font)
        header_width = header_bbox[2] - header_bbox[0]
        header_x = (total_width - header_width) // 2
        draw.text((header_x, 20), header_text, fill='black', font=header_font)
        
        # Add QR code centered
        qr_image_resized = qr_image.resize((qr_size, qr_size))
        composite.paste(qr_image_resized, (0, header_height))
        
        # Center the description text
        description = "Scan to report safety issues"
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
        
        # Create the incident
        serializer = self.get_serializer(data=request.data)
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
                       window.location.href = 'http://localhost:3000/hex/public/{site_id}/';
                   </script>
        </head>
        <body>
            <p>Redirecting to feedback form...</p>
        </body>
        </html>
        """)
    except Site.DoesNotExist:
        return HttpResponse("Site not found", status=404) 