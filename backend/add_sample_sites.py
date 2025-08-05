#!/usr/bin/env python
"""
Script to add sample sites to the database for testing purposes.
"""
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hexaclimate.settings')
django.setup()

from api.models import Site

def add_sample_sites():
    """Add sample sites to the database"""
    sample_sites = [
        {
            'name': 'Hexa Climate HQ',
            'address': '123 Business Park, Tech District, Bangalore, Karnataka 560001'
        },
        {
            'name': 'Manufacturing Plant Alpha',
            'address': '456 Industrial Zone, Sector 5, Mumbai, Maharashtra 400001'
        },
        {
            'name': 'Research & Development Center',
            'address': '789 Innovation Hub, Electronic City, Bangalore, Karnataka 560100'
        },
        {
            'name': 'Distribution Center North',
            'address': '321 Logistics Park, Gurgaon, Haryana 122001'
        },
        {
            'name': 'Customer Service Office',
            'address': '654 Service Plaza, Connaught Place, New Delhi, Delhi 110001'
        }
    ]
    
    created_sites = []
    for site_data in sample_sites:
        site, created = Site.objects.get_or_create(
            name=site_data['name'],
            defaults={'address': site_data['address']}
        )
        if created:
            created_sites.append(site)
            print(f"Created site: {site.name}")
        else:
            print(f"Site already exists: {site.name}")
    
    print(f"\nTotal sites in database: {Site.objects.count()}")
    print("All sites:")
    for site in Site.objects.all():
        print(f"- {site.name} (ID: {site.id})")

if __name__ == '__main__':
    add_sample_sites() 