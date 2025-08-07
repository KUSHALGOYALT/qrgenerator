from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SiteViewSet, EmergencyContactViewSet, IncidentViewSet, 
    NotificationEmailViewSet, AuthViewSet, IncidentTypeViewSet
)

router = DefaultRouter()
router.register(r'sites', SiteViewSet)
router.register(r'emergency-contacts', EmergencyContactViewSet)
router.register(r'incidents', IncidentViewSet)
router.register(r'notification-emails', NotificationEmailViewSet)
router.register(r'incident-types', IncidentTypeViewSet)
router.register(r'auth', AuthViewSet, basename='auth')

urlpatterns = [
    path('', include(router.urls)),
] 