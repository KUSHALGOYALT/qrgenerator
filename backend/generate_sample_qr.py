#!/usr/bin/env python3
"""
Generate a sample QR code image with Hexa Climate logo
"""

import os
import sys
import qrcode
from PIL import Image, ImageDraw, ImageFont

def create_sample_qr():
    """Create a sample QR code with Hexa Climate logo"""
    
    print("🎨 Creating sample QR code with Hexa Climate logo...")
    
    # First create the logo
    logo_size = 100
    logo_img = Image.new('RGBA', (logo_size, logo_size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(logo_img)
    
    # Try to use a nice font
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 28)
    except:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 28)
        except:
            font = ImageFont.load_default()
    
    # Draw "HEXA" text in professional style
    text = "HEXA"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Center the text
    x = (logo_size - text_width) // 2
    y = (logo_size - text_height) // 2
    
    # Draw text in professional dark blue color (Hexa Climate brand color)
    draw.text((x, y), text, fill=(0, 51, 102, 255), font=font)
    
    # Add a subtle border/background circle for better visibility
    circle_radius = 45
    circle_center = (logo_size // 2, logo_size // 2)
    circle_bbox = (
        circle_center[0] - circle_radius,
        circle_center[1] - circle_radius,
        circle_center[0] + circle_radius,
        circle_center[1] + circle_radius
    )
    
    # Draw a light blue background circle
    draw.ellipse(circle_bbox, fill=(240, 248, 255, 200), outline=(0, 51, 102, 255), width=2)
    
    # Create a sample QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data("https://hse.hexaclimate.com/public/1/")
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
    
    # Position logo and site name at the top
    logo_size_small = 40
    logo_x = 20
    logo_y = (header_height - logo_size_small) // 2
    
    # Try to load Hexa Climate logo from web URL
    import requests
    from io import BytesIO
    
    logo_url = "https://hexaclimate.com/wp-content/uploads/2023/11/Hexa-Logo-with-black-text-1.svg"
    
    try:
        # Download the logo from the web
        response = requests.get(logo_url, timeout=10)
        response.raise_for_status()
        
        # Convert SVG to PNG using cairosvg if available
        try:
            import cairosvg
            png_data = cairosvg.svg2png(bytestring=response.content, output_width=logo_size_small, output_height=logo_size_small)
            logo_img_small = Image.open(BytesIO(png_data))
            composite.paste(logo_img_small, (logo_x, logo_y), logo_img_small if logo_img_small.mode == 'RGBA' else None)
            print(f"✅ Using actual Hexa Climate logo from web")
        except ImportError:
            # Fallback to generated logo if cairosvg not available
            print(f"⚠️  cairosvg not available, using generated logo")
            logo_img_small = logo_img.resize((logo_size_small, logo_size_small), Image.Resampling.LANCZOS)
            composite.paste(logo_img_small, (logo_x, logo_y), logo_img_small if logo_img_small.mode == 'RGBA' else None)
            
    except Exception as e:
        print(f"⚠️  Error loading web logo: {e}")
        # Fallback to generated logo
        logo_img_small = logo_img.resize((logo_size_small, logo_size_small), Image.Resampling.LANCZOS)
        composite.paste(logo_img_small, (logo_x, logo_y), logo_img_small if logo_img_small.mode == 'RGBA' else None)
    
    # Handle site name on the right side of the logo
    site_name = "Hexa Climate Site"
    site_bbox = draw.textbbox((0, 0), site_name, font=header_font)
    site_width = site_bbox[2] - site_bbox[0]
    
    # Calculate available space for site name
    logo_end = logo_x + logo_size_small + 15
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
    
    # Save the sample image
    sample_path = "sample_qr_with_hexa_logo.png"
    composite.save(sample_path)
    print(f"💾 Sample QR code saved to: {sample_path}")
    
    # Print layout details
    print(f"📐 Sample QR Code Layout:")
    print(f"   - Total size: {total_width}x{total_height} pixels")
    print(f"   - Header: {total_width}x{header_height} pixels")
    print(f"   - QR code: {qr_size}x{qr_size} pixels")
    print(f"   - Logo: {logo_size_small}x{logo_size_small} pixels")
    print(f"   - Description: {desc_width} pixels wide")
    
    print("🎉 Sample QR code generated successfully!")
    return sample_path

if __name__ == "__main__":
    sample_path = create_sample_qr()
    print(f"\n✅ Sample QR code created: {sample_path}")
