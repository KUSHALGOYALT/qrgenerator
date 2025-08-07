#!/usr/bin/env python3
"""
Test script for new QR code layout with QR on the left side
"""

import os
import sys
import qrcode
from PIL import Image, ImageDraw, ImageFont

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_new_qr_layout():
    """Test the new QR code layout with vertical arrangement"""
    
    print("🧪 Testing new QR code layout with vertical arrangement...")
    
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
    
    # New layout parameters - vertical arrangement
    qr_size = 300
    header_height = 80
    description_height = 60
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
    
    # Position logo and site name at the top
    logo_size = 40
    logo_x = 20
    logo_y = (header_height - logo_size) // 2
    
    # Create a placeholder logo (text-based)
    logo_text = "HEXA"
    logo_bbox = draw.textbbox((0, 0), logo_text, font=header_font)
    logo_width = logo_bbox[2] - logo_bbox[0]
    draw.text((logo_x, logo_y + 10), logo_text, fill='black', font=header_font)
    
    # Handle site name - always positioned to the right of the logo
    site_name = "Sample Site Name"
    site_bbox = draw.textbbox((0, 0), site_name, font=header_font)
    site_width = site_bbox[2] - site_bbox[0]
    
    # Calculate available space for site name
    logo_end = logo_x + logo_size + 15  # 15px spacing after logo
    available_width = total_width - logo_end - 20
    
    # Always position site name to the right of logo (logo is always on the left)
    site_x = logo_end
    site_y = (header_height - site_bbox[3]) // 2
    draw.text((site_x, site_y), site_name, fill='black', font=header_font)
    
    # Add QR code in the middle (centered horizontally)
    qr_x = (total_width - qr_size) // 2
    qr_y = header_height
    qr_image_resized = qr_image.resize((qr_size, qr_size))
    composite.paste(qr_image_resized, (qr_x, qr_y))
    
    # Center the description text at the bottom
    description = "Scan for Site info and Reporting Issues"
    desc_bbox = draw.textbbox((0, 0), description, font=desc_font)
    desc_width = desc_bbox[2] - desc_bbox[0]
    desc_x = (total_width - desc_width) // 2
    desc_y = header_height + qr_size + 15
    draw.text((desc_x, desc_y), description, fill='black', font=desc_font)
    
    # Save the test image
    test_path = "test_new_qr_layout.png"
    composite.save(test_path)
    print(f"💾 New layout test image saved to: {test_path}")
    
    # Print layout details
    print(f"📐 Layout Details:")
    print(f"   - Total size: {total_width}x{total_height} pixels")
    print(f"   - Header: {total_width}x{header_height} pixels")
    print(f"   - QR code: {qr_size}x{qr_size} at ({qr_x}, {qr_y})")
    print(f"   - Logo: {logo_size}x{logo_size} at ({logo_x}, {logo_y})")
    print(f"   - Site name: at ({site_x}, {site_y})")
    print(f"   - Description: at ({desc_x}, {desc_y})")
    
    print("🎉 New QR layout test completed successfully!")
    return True

if __name__ == "__main__":
    success = test_new_qr_layout()
    if success:
        print("\n✅ New QR layout test completed successfully!")
    else:
        print("\n❌ New QR layout test failed!")
        sys.exit(1)
