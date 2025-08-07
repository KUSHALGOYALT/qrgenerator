#!/usr/bin/env python
"""
Test logo functionality without database dependencies
"""
from PIL import Image, ImageDraw, ImageFont
import os

def test_logo_placement():
    """Test logo placement in QR code layout"""
    print("🧪 Testing Logo Placement in QR Code...")
    
    # Simulate the QR code generation layout
    qr_size = 350
    header_height = 80
    description_height = 60
    total_height = header_height + qr_size + description_height
    total_width = qr_size
    
    # Create the composite image
    composite = Image.new('RGB', (total_width, total_height), 'white')
    draw = ImageDraw.Draw(composite)
    
    # Try to use better fonts
    try:
        header_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 18)
        desc_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 16)
    except:
        try:
            header_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
            desc_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 16)
        except:
            header_font = ImageFont.load_default()
            desc_font = ImageFont.load_default()
    
    # Add logo image on the left side
    logo_size = 40
    logo_x = 20
    logo_y = (header_height - logo_size) // 2
    
    # Try to load logo image
    logo_path = os.path.join('static', 'images', 'logo.png')
    if os.path.exists(logo_path):
        try:
            logo_img = Image.open(logo_path)
            # Resize logo to fit
            logo_img = logo_img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
            # Paste logo onto composite image
            composite.paste(logo_img, (logo_x, logo_y))
            print(f"✅ Logo loaded and placed at ({logo_x}, {logo_y})")
        except Exception as e:
            print(f"⚠️  Error loading logo: {e}")
            # Fallback to text logo
            logo_text = "LOGO"
            logo_bbox = draw.textbbox((0, 0), logo_text, font=header_font)
            logo_width = logo_bbox[2] - logo_bbox[0]
            draw.text((logo_x, logo_y + 10), logo_text, fill='black', font=header_font)
    else:
        print(f"⚠️  Logo not found at: {logo_path}")
        # Fallback to text logo
        logo_text = "LOGO"
        logo_bbox = draw.textbbox((0, 0), logo_text, font=header_font)
        logo_width = logo_bbox[2] - logo_bbox[0]
        draw.text((logo_x, logo_y + 10), logo_text, fill='black', font=header_font)
    
    # Handle site name on the right side of the logo
    site_name = "Test Site with Long Name"
    site_bbox = draw.textbbox((0, 0), site_name, font=header_font)
    site_width = site_bbox[2] - site_bbox[0]
    
    # Calculate available space for site name
    logo_end = logo_x + logo_size + 15
    available_width = total_width - logo_end - 20
    
    # If site name is too long, truncate it
    if site_width > available_width:
        truncated_name = site_name
        while truncated_name and draw.textbbox((0, 0), truncated_name + "...", font=header_font)[2] > available_width:
            truncated_name = truncated_name[:-1]
        site_name = truncated_name + "..." if truncated_name else site_name[:10] + "..."
        site_bbox = draw.textbbox((0, 0), site_name, font=header_font)
        site_width = site_bbox[2] - site_bbox[0]
    
    # Position site name to the right of logo
    site_x = logo_end
    site_y = (header_height - site_bbox[3]) // 2
    draw.text((site_x, site_y), site_name, fill='black', font=header_font)
    print(f"✅ Site name placed at ({site_x}, {site_y}): {site_name}")
    
    # Add a placeholder QR code area
    qr_placeholder = Image.new('RGB', (qr_size, qr_size), '#f0f0f0')
    composite.paste(qr_placeholder, (0, header_height))
    print(f"✅ QR code placeholder placed at (0, {header_height})")
    
    # Add description text
    description = "Scan for Site info and Reporting Issues"
    desc_bbox = draw.textbbox((0, 0), description, font=desc_font)
    desc_width = desc_bbox[2] - desc_bbox[0]
    desc_x = (total_width - desc_width) // 2
    draw.text((desc_x, header_height + qr_size + 15), description, fill='black', font=desc_font)
    print(f"✅ Description placed at ({desc_x}, {header_height + qr_size + 15})")
    
    # Save the test image
    test_output = "test_qr_with_logo.png"
    composite.save(test_output)
    print(f"✅ Test image saved as: {test_output}")
    
    return True

if __name__ == '__main__':
    success = test_logo_placement()
    if success:
        print("\n🎉 Logo placement test completed successfully!")
        print("📁 Check the generated 'test_qr_with_logo.png' file to see the layout.")
    else:
        print("\n❌ Logo placement test failed!")
