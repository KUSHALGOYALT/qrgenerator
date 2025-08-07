#!/usr/bin/env python3
"""
Create a simple PNG logo for Hexa Climate
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_hexa_logo():
    """Create a professional PNG logo for Hexa Climate"""
    
    # Create logo image
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
    
    # Create static/images directory if it doesn't exist
    static_dir = os.path.join(os.path.dirname(__file__), 'static', 'images')
    os.makedirs(static_dir, exist_ok=True)
    
    # Save the logo
    logo_path = os.path.join(static_dir, 'hexa_logo.png')
    logo_img.save(logo_path)
    print(f"✅ Hexa Climate logo created at: {logo_path}")
    
    return logo_path

if __name__ == "__main__":
    create_hexa_logo()
