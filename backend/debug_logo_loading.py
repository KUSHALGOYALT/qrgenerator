#!/usr/bin/env python3
"""
Debug script to test logo loading
"""

import os
import sys
from PIL import Image

def debug_logo_loading():
    """Debug the logo loading process"""
    
    print("🔍 Debugging logo loading...")
    
    # Check if logo file exists
    logo_path = os.path.join(os.path.dirname(__file__), 'static', 'images', 'hexa_logo.png')
    print(f"📁 Logo path: {logo_path}")
    print(f"📁 File exists: {os.path.exists(logo_path)}")
    
    if os.path.exists(logo_path):
        print(f"📏 File size: {os.path.getsize(logo_path)} bytes")
        
        try:
            # Try to open the logo
            logo_img = Image.open(logo_path)
            print(f"✅ Logo opened successfully")
            print(f"📐 Logo size: {logo_img.size}")
            print(f"🎨 Logo mode: {logo_img.mode}")
            
            # Try to resize
            logo_size = 40
            logo_img_resized = logo_img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
            print(f"✅ Logo resized successfully to {logo_size}x{logo_size}")
            
            # Test pasting
            test_img = Image.new('RGB', (100, 100), 'white')
            test_img.paste(logo_img_resized, (10, 10), logo_img_resized if logo_img_resized.mode == 'RGBA' else None)
            print(f"✅ Logo pasted successfully")
            
            # Save test image
            test_path = "debug_logo_test.png"
            test_img.save(test_path)
            print(f"💾 Test image saved: {test_path}")
            
        except Exception as e:
            print(f"❌ Error loading logo: {e}")
            import traceback
            traceback.print_exc()
    else:
        print("❌ Logo file not found!")
        
        # List contents of static/images directory
        static_dir = os.path.join(os.path.dirname(__file__), 'static', 'images')
        if os.path.exists(static_dir):
            print(f"📁 Contents of {static_dir}:")
            for file in os.listdir(static_dir):
                file_path = os.path.join(static_dir, file)
                size = os.path.getsize(file_path)
                print(f"   - {file} ({size} bytes)")
        else:
            print(f"❌ Directory {static_dir} does not exist")

if __name__ == "__main__":
    debug_logo_loading()
