"""
URL configuration for hexaclimate project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import redirect
from django.http import HttpResponse

def redirect_to_frontend(request, site_id):
    """Redirect to the frontend public feedback form"""
    frontend_url = f"https://hse.hexaclimate.com/public/{site_id}/"
    return redirect(frontend_url)

urlpatterns = [
    path('hex/admin/', admin.site.urls),
    path('hex/api/', include('api.urls')),
    path('public/<str:site_id>/', redirect_to_frontend, name='public_redirect'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static('/hex/static/', document_root=settings.STATIC_ROOT) 