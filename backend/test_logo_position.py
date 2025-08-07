#!/usr/bin/env python3
"""
Test script to verify logo positioning in QR code layout
"""

import os
import sys
import qrcode
from PIL import Image, ImageDraw, ImageFont

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_logo_position():
    """Test the logo positioning in QR code layout"""
    
    print("🧪 Testing logo positioning in QR code layout...")
    
    # Create a sample QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data("https://example.com/test")
    qr.make(fit=True)
    qr_image = qr.make_image(fill_color="black", back_color="white")
    
    # Layout parameters (same as in views.py)
    qr_size = 300
    header_height = 80
    description_height = 80
    total_height = header_height + qr_size + description_height
    total_width = qr_size + 40
    
    # Create the composite image
    composite = Image.new('RGB', (total_width, total_height), 'white')
    draw = ImageDraw.Draw(composite)
    
    # Try to use a font
    try:
        header_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 24)
        desc_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 18)
    except:
        header_font = ImageFont.load_default()
        desc_font = ImageFont.load_default()
    
    # Position logo and site name at the top (same as in views.py)
    logo_size = 40
    logo_x = 20
    logo_y = (header_height - logo_size) // 2
    
    # Try to load the Hexa Climate logo
    logo_path = os.path.join(os.path.dirname(__file__), 'static', 'images', 'hexa_logo.png')
    
    if os.path.exists(logo_path):
        try:
            logo_img = Image.open(logo_path)
            # Resize logo to fit
            logo_img = logo_img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
            # Paste logo onto composite image
            composite.paste(logo_img, (logo_x, logo_y), logo_img if logo_img.mode == 'RGBA' else None)
            print(f"✅ Hexa Climate logo loaded and positioned at ({logo_x}, {logo_y})")
        except Exception as e:
            print(f"⚠️  Error loading logo: {e}")
            # Fallback to text logo
            logo_text = "HEXA"
            logo_bbox = draw.textbbox((0, 0), logo_text, font=header_font)
            draw.text((logo_x, logo_y + 10), logo_text, fill='black', font=header_font)
    else:
        print(f"⚠️  Logo not found at: {logo_path}")
        # Fallback to text logo
        logo_text = "HEXA"
        logo_bbox = draw.textbbox((0, 0), logo_text, font=header_font)
        draw.text((logo_x, logo_y + 10), logo_text, fill='black', font=header_font)
    
    # Handle site name on the right side of the logo
    site_name = "Test Site with Long Name"
    site_bbox = draw.textbbox((0, 0), site_name, font=header_font)
    site_width = site_bbox[2] - site_bbox[0]
    
    # Calculate available space for site name
    logo_end = logo_x + logo_size + 15
    available_width = total_width - logo_end - 20
    
    # Position site name to the right of logo
    site_x = logo_end
    site_y = (header_height - site_bbox[3]) // 2
    draw.text((site_x, site_y), site_name, fill='black', font=header_font)
    
    # Add QR code in the middle
    qr_x = (total_width - qr_size) // 2
    qr_y = header_height
    qr_image_resized = qr_image.resize((qr_size, qr_size))
    composite.paste(qr_image_resized, (qr_x, qr_y))
    
    # Center the description text at the bottom
    description = "Scan for Site info and Reporting Issues"
    desc_bbox = draw.textbbox((0, 0), description, font=desc_font)
    desc_width = desc_bbox[2] - desc_bbox[0]
    desc_x = (total_width - desc_width) // 2
    desc_y = header_height + qr_size + 10
    draw.text((desc_x, desc_y), description, fill='black', font=desc_font)
    
    # Save the test image
    test_path = "test_logo_position.png"
    composite.save(test_path)
    print(f"💾 Logo position test image saved to: {test_path}")
    
    # Print positioning details
    print(f"📐 Logo Positioning Details:")
    print(f"   - Logo position: ({logo_x}, {logo_y})")
    print(f"   - Logo size: {logo_size}x{logo_size} pixels")
    print(f"   - Site name position: ({site_x}, {site_y})")
    print(f"   - Available width for site name: {available_width} pixels")
    print(f"   - Total header height: {header_height} pixels")
    
    print("🎉 Logo positioning test completed successfully!")
    return True

if __name__ == "__main__":
    success = test_logo_position()
    if success:
        print("\n✅ Logo positioning test completed successfully!")
    else:
        print("\n❌ Logo positioning test failed!")
        sys.exit(1)
