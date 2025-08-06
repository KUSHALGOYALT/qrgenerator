from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SiteViewSet, EmergencyContactViewSet, IncidentViewSet, NotificationEmailViewSet

router = DefaultRouter()
router.register(r'sites', SiteViewSet)
router.register(r'emergency-contacts', EmergencyContactViewSet)
router.register(r'incidents', IncidentViewSet)
router.register(r'notification-emails', NotificationEmailViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 