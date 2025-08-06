"""
URL configuration for hexaclimate project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from api.views import public_site_view

urlpatterns = [
    path('hex/admin/', admin.site.urls),
    path('hex/api/', include('api.urls')),
    path('hex/public/<str:site_id>/', public_site_view, name='public_site'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static('/hex/static/', document_root=settings.STATIC_ROOT) 