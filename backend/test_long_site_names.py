#!/usr/bin/env python3
"""
Test script to demonstrate long site name handling
"""

import os
import sys
import qrcode
from PIL import Image, ImageDraw, ImageFont

def test_long_site_names():
    """Test how the system handles different site name lengths"""
    
    print("🧪 Testing long site name handling...")
    
    # Test different site name lengths
    test_sites = [
        "Short Site",
        "Medium Length Site Name",
        "Very Long Site Name That Exceeds Normal Limits",
        "Extremely Long Site Name That Should Be Handled Properly With Smart Truncation",
        "Another Site with Quite a Long Name That Needs to Be Displayed"
    ]
    
    for i, site_name in enumerate(test_sites):
        print(f"\n📝 Testing site: '{site_name}'")
        
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
        total_width = qr_size + 80  # Increased width for long names
        
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
        
        # Create a simple logo (text-based for testing)
        logo_text = "HEXA"
        logo_bbox = draw.textbbox((0, 0), logo_text, font=header_font)
        draw.text((logo_x, logo_y + 10), logo_text, fill='black', font=header_font)
        
        # Handle site name - same logic as in views.py
        site_bbox = draw.textbbox((0, 0), site_name, font=header_font)
        site_width = site_bbox[2] - site_bbox[0]
        
        # Calculate available space for site name
        logo_end = logo_x + logo_size + 15
        available_width = total_width - logo_end - 20
        
        print(f"   - Original name length: {len(site_name)} characters")
        print(f"   - Available width: {available_width} pixels")
        print(f"   - Name width: {site_width} pixels")
        
        # If site name is too long, try different strategies
        if site_width > available_width:
            # Strategy 1: Try with smaller font
            try:
                small_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 18)
                small_bbox = draw.textbbox((0, 0), site_name, font=small_font)
                small_width = small_bbox[2] - small_bbox[0]
                
                if small_width <= available_width:
                    # Use smaller font
                    header_font = small_font
                    site_bbox = small_bbox
                    site_width = small_width
                    print(f"   ✅ Using smaller font (18px)")
                else:
                    # Strategy 2: Smart truncation
                    min_length = max(10, int(len(site_name) * 0.7))
                    truncated_name = site_name[:min_length]
                    
                    while truncated_name and draw.textbbox((0, 0), truncated_name + "...", font=header_font)[2] > available_width:
                        truncated_name = truncated_name[:-1]
                    
                    site_name = truncated_name + "..." if truncated_name else site_name[:15] + "..."
                    site_bbox = draw.textbbox((0, 0), site_name, font=header_font)
                    site_width = site_bbox[2] - site_bbox[0]
                    print(f"   ✅ Truncated to: '{site_name}'")
            except:
                # Fallback truncation
                truncated_name = site_name
                while truncated_name and draw.textbbox((0, 0), truncated_name + "...", font=header_font)[2] > available_width:
                    truncated_name = truncated_name[:-1]
                site_name = truncated_name + "..." if truncated_name else site_name[:10] + "..."
                site_bbox = draw.textbbox((0, 0), site_name, font=header_font)
                site_width = site_bbox[2] - site_bbox[0]
                print(f"   ✅ Fallback truncation: '{site_name}'")
        else:
            print(f"   ✅ Name fits perfectly")
        
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
        test_path = f"test_long_site_name_{i+1}.png"
        composite.save(test_path)
        print(f"   💾 Saved as: {test_path}")
    
    print(f"\n🎉 Long site name testing completed!")
    return True

if __name__ == "__main__":
    success = test_long_site_names()
    if success:
        print("\n✅ Long site name test completed successfully!")
    else:
        print("\n❌ Long site name test failed!")
        sys.exit(1)
