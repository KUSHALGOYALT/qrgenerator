#!/usr/bin/env python
"""
Create a simple placeholder logo for QR code generation
"""
from PIL import Image, ImageDraw, ImageFont
import os

def create_logo():
    """Create a simple placeholder logo"""
    # Create a 100x100 image with white background
    logo_size = 100
    img = Image.new('RGB', (logo_size, logo_size), 'white')
    draw = ImageDraw.Draw(img)
    
    # Draw a simple circular logo
    margin = 10
    circle_bbox = [margin, margin, logo_size - margin, logo_size - margin]
    draw.ellipse(circle_bbox, fill='#2563eb', outline='#1d4ed8', width=3)
    
    # Add text in the center
    try:
        # Try to use a system font
        font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 24)
    except:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
        except:
            font = ImageFont.load_default()
    
    text = "LOGO"
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    
    # Center the text
    x = (logo_size - text_width) // 2
    y = (logo_size - text_height) // 2
    
    draw.text((x, y), text, fill='white', font=font)
    
    # Save the logo
    logo_path = os.path.join('static', 'images', 'logo.png')
    img.save(logo_path)
    print(f"✅ Logo created at: {logo_path}")
    
    return logo_path

if __name__ == '__main__':
    create_logo()
