from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SiteViewSet, EmergencyContactViewSet, IncidentViewSet

router = DefaultRouter()
router.register(r'sites', SiteViewSet)
router.register(r'emergency-contacts', EmergencyContactViewSet)
router.register(r'incidents', IncidentViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 