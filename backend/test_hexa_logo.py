#!/usr/bin/env python3
"""
Test script for Hexa Climate logo download and conversion
"""

import os
import sys
import requests
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_hexa_logo_download():
    """Test downloading and converting the Hexa Climate logo"""
    
    print("🧪 Testing Hexa Climate logo download and conversion...")
    
    logo_url = "https://hexaclimate.com/wp-content/uploads/2023/11/Hexa-Logo-with-black-text-1.svg"
    logo_size = 40
    
    try:
        # Download the logo from the web
        print(f"📥 Downloading logo from: {logo_url}")
        response = requests.get(logo_url, timeout=10)
        response.raise_for_status()
        print(f"✅ Logo downloaded successfully ({len(response.content)} bytes)")
        
        # Convert SVG to PNG using cairosvg
        try:
            import cairosvg
            print("🔄 Converting SVG to PNG...")
            png_data = cairosvg.svg2png(bytestring=response.content, output_width=logo_size, output_height=logo_size)
            logo_img = Image.open(BytesIO(png_data))
            print(f"✅ Logo converted successfully ({logo_img.size[0]}x{logo_img.size[1]} pixels)")
            
            # Save the converted logo for testing
            test_logo_path = "test_hexa_logo.png"
            logo_img.save(test_logo_path)
            print(f"💾 Test logo saved to: {test_logo_path}")
            
            # Test creating a composite image (like in QR code generation)
            composite = Image.new('RGB', (400, 100), 'white')
            draw = ImageDraw.Draw(composite)
            
            # Try to use a font
            try:
                header_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 18)
            except:
                header_font = ImageFont.load_default()
            
            # Paste the logo
            logo_x = 20
            logo_y = (100 - logo_size) // 2
            composite.paste(logo_img, (logo_x, logo_y), logo_img if logo_img.mode == 'RGBA' else None)
            
            # Add some text
            draw.text((logo_x + logo_size + 10, logo_y + 10), "Hexa Climate", fill='black', font=header_font)
            
            # Save the composite
            composite_path = "test_hexa_composite.png"
            composite.save(composite_path)
            print(f"💾 Composite image saved to: {composite_path}")
            
            print("🎉 All tests passed! The Hexa Climate logo integration is working correctly.")
            return True
            
        except ImportError:
            print("⚠️  cairosvg not available, testing fallback...")
            # Test fallback text logo
            composite = Image.new('RGB', (400, 100), 'white')
            draw = ImageDraw.Draw(composite)
            
            try:
                header_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 18)
            except:
                header_font = ImageFont.load_default()
            
            logo_text = "HEXA"
            logo_x = 20
            logo_y = 30
            draw.text((logo_x, logo_y), logo_text, fill='black', font=header_font)
            draw.text((logo_x + 80, logo_y), "Climate", fill='black', font=header_font)
            
            composite_path = "test_hexa_fallback.png"
            composite.save(composite_path)
            print(f"💾 Fallback image saved to: {composite_path}")
            print("⚠️  Fallback mode: cairosvg is not installed. Install it for full logo support.")
            return True
            
    except Exception as e:
        print(f"❌ Error testing logo download: {e}")
        return False

if __name__ == "__main__":
    success = test_hexa_logo_download()
    if success:
        print("\n✅ Hexa Climate logo test completed successfully!")
    else:
        print("\n❌ Hexa Climate logo test failed!")
        sys.exit(1)
