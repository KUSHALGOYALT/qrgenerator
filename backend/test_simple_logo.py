#!/usr/bin/env python3
"""
Simple test script for logo functionality
"""

import os
import sys
from PIL import Image, ImageDraw, ImageFont

def test_simple_logo():
    """Test simple logo creation and QR code generation"""
    
    print("🧪 Testing simple logo and QR code generation...")
    
    # Create a simple QR code
    try:
        import qrcode
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data("https://hse.hexaclimate.com/public/1/")
        qr.make(fit=True)
        qr_image = qr.make_image(fill_color="black", back_color="white")
        print("✅ QR code created successfully")
    except ImportError:
        print("⚠️  qrcode not available, creating placeholder")
        qr_image = Image.new('RGB', (300, 300), 'white')
    
    # Layout parameters
    qr_size = 300
    header_height = 80
    description_height = 80
    total_height = header_height + qr_size + description_height
    total_width = qr_size + 80
    
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
    
    # Position logo and site name at the top
    logo_size = 40
    logo_x = 20
    logo_y = (header_height - logo_size) // 2
    
    # Create a simple Hexa Climate logo (text-based)
    logo_text = "HEXA"
    logo_bbox = draw.textbbox((0, 0), logo_text, font=header_font)
    logo_width = logo_bbox[2] - logo_bbox[0]
    
    # Draw logo in blue color
    draw.text((logo_x, logo_y + 10), logo_text, fill=(0, 51, 102), font=header_font)
    print("✅ Logo created successfully")
    
    # Handle site name on the right side of the logo
    site_name = "Hexa Climate Site"
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
    test_path = "simple_qr_test.png"
    composite.save(test_path)
    print(f"💾 Simple QR test image saved to: {test_path}")
    
    # Print layout details
    print(f"📐 Layout Details:")
    print(f"   - Total size: {total_width}x{total_height} pixels")
    print(f"   - Logo: {logo_size}x{logo_size} pixels at ({logo_x}, {logo_y})")
    print(f"   - Site name: at ({site_x}, {site_y})")
    print(f"   - QR code: {qr_size}x{qr_size} pixels at ({qr_x}, {qr_y})")
    print(f"   - Description: at ({desc_x}, {desc_y})")
    
    print("🎉 Simple logo test completed successfully!")
    return True

if __name__ == "__main__":
    success = test_simple_logo()
    if success:
        print("\n✅ Simple logo test completed successfully!")
    else:
        print("\n❌ Simple logo test failed!")
        sys.exit(1)
