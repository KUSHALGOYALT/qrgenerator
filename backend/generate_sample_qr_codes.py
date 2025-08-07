#!/usr/bin/env python3
"""
Generate sample QR code PNG files for testing
"""

import os
import sys
from PIL import Image, ImageDraw, ImageFont
import qrcode

def generate_sample_qr_codes():
    """Generate sample QR code PNG files for different site names"""
    
    print("🎨 Generating sample QR code PNG files...")
    
    # Sample site names for testing
    sample_sites = [
        {
            "name": "Hexa Climate Factory - Mumbai",
            "url": "https://hse.hexaclimate.com/public/1/"
        },
        {
            "name": "Hexa Climate Construction Site - Delhi",
            "url": "https://hse.hexaclimate.com/public/2/"
        },
        {
            "name": "Hexa Climate Manufacturing Plant - Bangalore",
            "url": "https://hse.hexaclimate.com/public/3/"
        },
        {
            "name": "Hexa Climate Chemical Plant - Chennai",
            "url": "https://hse.hexaclimate.com/public/4/"
        },
        {
            "name": "Hexa Climate Power Plant - Hyderabad",
            "url": "https://hse.hexaclimate.com/public/5/"
        },
        {
            "name": "Short Site",
            "url": "https://hse.hexaclimate.com/public/6/"
        },
        {
            "name": "Very Long Site Name That Should Be Truncated",
            "url": "https://hse.hexaclimate.com/public/7/"
        },
        {
            "name": "Extremely Long Site Name That Will Definitely Need Truncation And Should Show The Smart Truncation Feature",
            "url": "https://hse.hexaclimate.com/public/8/"
        }
    ]
    
    for i, site_data in enumerate(sample_sites):
        site_name = site_data["name"]
        qr_url = site_data["url"]
        
        print(f"\n📝 Generating QR for: '{site_name}'")
        
        # Create QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_url)
        qr.make(fit=True)
        qr_image = qr.make_image(fill_color="black", back_color="white")
        
        # Layout parameters with balanced spacing
        qr_size = 300
        header_height = 70  # Balanced height for better proportions
        description_height = 80
        
        # Balanced margins for professional layout
        margin_top = 25  # Balanced top margin
        margin_bottom = 35  # Increased bottom margin for more space
        margin_left = 20  # Balanced side margins
        margin_right = 20
        
        # Calculate total dimensions with balanced margins
        total_width = qr_size + margin_left + margin_right
        total_height = margin_top + header_height + qr_size + description_height + margin_bottom + 15  # Balanced extra spacing
        
        composite = Image.new('RGB', (total_width, total_height), 'white')
        draw = ImageDraw.Draw(composite)
        
        # Try to use a font
        try:
            header_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 28)
            desc_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 18)
        except:
            header_font = ImageFont.load_default()
            desc_font = ImageFont.load_default()
        
        # Position logo and site name at the top with better alignment
        logo_size = 50
        logo_x = margin_left
        logo_y = margin_top + (header_height - logo_size) // 2
        
        # Try to load Hexa Climate logo from local PNG file
        logo_path = os.path.join(os.path.dirname(__file__), 'static', 'images', 'image.png')
        
        if os.path.exists(logo_path):
            try:
                logo_img = Image.open(logo_path)
                logo_img = logo_img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
                composite.paste(logo_img, (logo_x, logo_y), logo_img if logo_img.mode == 'RGBA' else None)
                print(f"   ✅ Using uploaded Hexa Climate logo")
            except Exception as e:
                print(f"   ⚠️  Error loading logo: {e}")
                # Fallback to text logo
                logo_text = "HEXA"
                logo_bbox = draw.textbbox((0, 0), logo_text, font=header_font)
                draw.text((logo_x, logo_y + 10), logo_text, fill='black', font=header_font)
        else:
            print(f"   ⚠️  Logo not found at: {logo_path}")
            # Fallback to text logo
            logo_text = "HEXA"
            logo_bbox = draw.textbbox((0, 0), logo_text, font=header_font)
            draw.text((logo_x, logo_y + 10), logo_text, fill='black', font=header_font)
        
        # Handle site name with better positioning and alignment
        site_bbox = draw.textbbox((0, 0), site_name, font=header_font)
        site_width = site_bbox[2] - site_bbox[0]
        site_height = site_bbox[3] - site_bbox[1]
        
        # Calculate available space for site name
        logo_end = logo_x + logo_size + 20
        available_width = total_width - logo_end - 30
        
        # Check if site name fits, if not, try smaller font
        if site_width > available_width:
            try:
                smaller_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 22)
                site_bbox = draw.textbbox((0, 0), site_name, font=smaller_font)
                site_width = site_bbox[2] - site_bbox[0]
                site_height = site_bbox[3] - site_bbox[1]
                
                if site_width > available_width:
                    # For extremely long names, adjust the total width to accommodate the full name
                    required_width = logo_end + site_width + 30
                    if required_width > total_width:
                        # Recalculate total width to fit the full site name
                        total_width = required_width
                        # Recreate the composite image with new width
                        composite = Image.new('RGB', (total_width, total_height), 'white')
                        draw = ImageDraw.Draw(composite)
                        
                        # Reload logo with new positioning
                        if os.path.exists(logo_path):
                            try:
                                logo_img = Image.open(logo_path)
                                logo_img = logo_img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
                                composite.paste(logo_img, (logo_x, logo_y), logo_img if logo_img.mode == 'RGBA' else None)
                            except Exception as e:
                                logo_text = "HEXA"
                                logo_bbox = draw.textbbox((0, 0), logo_text, font=header_font)
                                draw.text((logo_x, logo_y + 10), logo_text, fill='black', font=header_font)
                        else:
                            logo_text = "HEXA"
                            logo_bbox = draw.textbbox((0, 0), logo_text, font=header_font)
                            draw.text((logo_x, logo_y + 10), logo_text, fill='black', font=header_font)
                        
                        print(f"   ✅ Adjusted total width to {total_width}px to accommodate full site name")
                
                # Position site name to the right of logo with proper vertical alignment
                site_x = logo_end
                site_y = margin_top + (header_height - site_height) // 2
                draw.text((site_x, site_y), site_name, fill='black', font=smaller_font)
            except:
                # Fallback to default font with width adjustment
                site_bbox = draw.textbbox((0, 0), site_name, font=header_font)
                site_width = site_bbox[2] - site_bbox[0]
                site_height = site_bbox[3] - site_bbox[1]
                
                # Adjust total width if needed
                required_width = logo_end + site_width + 30
                if required_width > total_width:
                    total_width = required_width
                    composite = Image.new('RGB', (total_width, total_height), 'white')
                    draw = ImageDraw.Draw(composite)
                    
                    # Reload logo
                    if os.path.exists(logo_path):
                        try:
                            logo_img = Image.open(logo_path)
                            logo_img = logo_img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
                            composite.paste(logo_img, (logo_x, logo_y), logo_img if logo_img.mode == 'RGBA' else None)
                        except Exception as e:
                            logo_text = "HEXA"
                            logo_bbox = draw.textbbox((0, 0), logo_text, font=header_font)
                            draw.text((logo_x, logo_y + 10), logo_text, fill='black', font=header_font)
                    else:
                        logo_text = "HEXA"
                        logo_bbox = draw.textbbox((0, 0), logo_text, font=header_font)
                        draw.text((logo_x, logo_y + 10), logo_text, fill='black', font=header_font)
                
                site_x = logo_end
                site_y = margin_top + (header_height - site_height) // 2
                draw.text((site_x, site_y), site_name, fill='black', font=header_font)
        else:
            # Position site name to the right of logo with proper vertical alignment
            site_x = logo_end
            site_y = margin_top + (header_height - site_height) // 2
            draw.text((site_x, site_y), site_name, fill='black', font=header_font)
        
        # Perfect centering calculations for QR code
        # Horizontal centering - ensure QR is perfectly centered
        qr_x = (total_width - qr_size) // 2
        
        # Vertical centering - QR should be exactly in the middle of the available space
        header_y = margin_top
        header_bottom = header_y + header_height
        
        # Calculate the middle point between header and description
        description = "Scan for Site info and Reporting Issues"
        desc_bbox = draw.textbbox((0, 0), description, font=desc_font)
        desc_height = desc_bbox[3] - desc_bbox[1]
        desc_y = total_height - margin_bottom - desc_height
        
        # Calculate the exact middle point between header bottom and description top
        # Add more space between QR and description
        available_height = desc_y - header_bottom
        qr_y = header_bottom + (available_height - qr_size) // 2
        
        # Add QR code with perfect centering
        composite.paste(qr_image, (qr_x, qr_y))
        
        # Center the description text at the bottom
        desc_width = desc_bbox[2] - desc_bbox[0]
        desc_x = (total_width - desc_width) // 2
        draw.text((desc_x, desc_y), description, fill='black', font=desc_font)
        
        # Save the sample QR code
        filename = f"sample_qr_{i+1:02d}_{site_name.replace(' ', '_').replace('-', '_')[:30]}.png"
        composite.save(filename)
        print(f"   💾 Saved: {filename}")
        print(f"   📐 Size: {total_width}x{total_height} pixels")
    
    print(f"\n🎉 Generated {len(sample_sites)} sample QR code PNG files!")
    print(f"📁 Files saved in: {os.getcwd()}")
    
    return len(sample_sites)

if __name__ == "__main__":
    try:
        count = generate_sample_qr_codes()
        print(f"\n✅ Successfully generated {count} sample QR code PNG files!")
    except Exception as e:
        print(f"❌ Error generating sample QR codes: {e}")
        sys.exit(1)
