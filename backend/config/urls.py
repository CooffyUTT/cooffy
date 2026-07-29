"""
URL configuration for config project.
https://docs.djangoproject.com/en/6.0/topics/http/urls/
"""
from django.contrib import admin
from django.conf.urls.static import static
from django.urls import path, include

from . import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/menu/', include('apps.products.urls')),
    path('api/branches/', include('apps.branches.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/schools/', include('apps.schools.urls')),
]

# Serving static and media files during development
# https://docs.djangoproject.com/en/6.0/howto/static-files/#serving-files-uploaded-by-a-user-during-development
# NOTE: In production, media files should be served by a dedicated web server (e.g. Nginx) or a CDN, not by Django.
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
