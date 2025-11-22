# Landing Page Images

## Required Images

### topbanner.png
- **Location**: `frontend/public/landingpage/images/topbanner.png`
- **Purpose**: Background image for the hero section on the landing page
- **Recommended Size**: 1920x600px or larger
- **Format**: PNG or JPG
- **Description**: Should show a real estate/property background that matches the red theme

## How to Add the Image

1. Place your `topbanner.png` image in this directory
2. The image will automatically be used as the background for the hero section
3. Make sure the image has good contrast for white text overlay

## Current Implementation

The hero section uses this image with:
- A dark gradient overlay (from-black/60 via-black/40 to-transparent)
- White text with drop shadows for readability
- Responsive background sizing (cover)
- Centered positioning

If the image is not present, the section will fall back to the gradient background defined in the CSS.
