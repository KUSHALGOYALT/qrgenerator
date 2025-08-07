# Sample Files for HSE Portal

This directory contains sample files for testing and demonstrating the HSE Portal functionality.

## 📁 Sample Files

### 1. `generate_sample_qr_codes.py`
Generates sample QR code PNG files for different site names.

**Usage:**
```bash
cd backend
python generate_sample_qr_codes.py
```

**Generates:**
- `sample_qr_01_Hexa_Climate_Factory_Mumbai.png`
- `sample_qr_02_Hexa_Climate_Construction_Site_Delhi.png`
- `sample_qr_03_Hexa_Climate_Manufacturing_Plant_Bangalore.png`
- `sample_qr_04_Hexa_Climate_Chemical_Plant_Chennai.png`
- `sample_qr_05_Hexa_Climate_Power_Plant_Hyderabad.png`
- `sample_qr_06_Short_Site.png`
- `sample_qr_07_Very_Long_Site_Name_That_Should_Be_Truncated.png`
- `sample_qr_08_Extremely_Long_Site_Name_That_Will_Definitely_Need_Truncation.png`

### 2. `add_sample_sites.py`
Creates sample sites in the database for testing.

**Usage:**
```bash
cd backend
python add_sample_sites.py
```

**Creates:**
- Sample sites with different names and addresses
- Emergency contacts for each site
- Notification email configurations

## 🎯 QR Code Features Demonstrated

### ✅ Perfect Centering
- QR code perfectly centered horizontally and vertically
- Equal spacing above and below QR code
- Professional layout with minimal gaps

### ✅ Logo Integration
- Your Hexa Climate logo (blue geometric 3D cube)
- Logo positioned to the left of site name
- Proper vertical alignment

### ✅ Dynamic Site Names
- Short names: Displayed in full
- Medium names: Displayed in full
- Long names: Font size reduction
- Extremely long names: Width adjustment to show full name

### ✅ Professional Design
- Clean white background
- High contrast for optimal scanning
- Consistent typography
- Professional spacing and margins

## 📱 QR Code Layout

Each QR code follows this layout:

```
┌─────────────────────────────────────┐
│ [Logo] Site Name                    │ ← Header
├─────────────────────────────────────┤
│                                     │
│         [QR Code]                   │ ← Perfectly Centered
│                                     │
├─────────────────────────────────────┤
│    Scan for Site info and           │ ← Description
│    Reporting Issues                 │
└─────────────────────────────────────┘
```

## 🔗 Sample URLs

The sample QR codes contain these URLs:
- `https://hse.hexaclimate.com/public/1/`
- `https://hse.hexaclimate.com/public/2/`
- `https://hse.hexaclimate.com/public/3/`
- `https://hse.hexaclimate.com/public/4/`
- `https://hse.hexaclimate.com/public/5/`
- `https://hse.hexaclimate.com/public/6/`
- `https://hse.hexaclimate.com/public/7/`
- `https://hse.hexaclimate.com/public/8/`

## 🎨 Design Specifications

- **QR Code Size**: 300x300 pixels
- **Logo Size**: 50x50 pixels
- **Header Height**: 100 pixels
- **Margins**: 20px (top, bottom, left, right)
- **Font**: Arial 28px (header), Arial 18px (description)
- **Background**: White
- **Text Color**: Black
- **Logo**: Your uploaded Hexa Climate logo

## 📊 File Sizes

Sample QR code files are approximately:
- **Short names**: ~11-12KB
- **Medium names**: ~12-13KB
- **Long names**: ~14-15KB
- **Extremely long names**: ~19-22KB

## 🚀 Production Ready

These sample files demonstrate the exact same functionality used in production:
- Same layout algorithm
- Same centering calculations
- Same logo integration
- Same dynamic text handling
- Same professional design standards

Perfect for testing, demonstration, and quality assurance! 🎉
