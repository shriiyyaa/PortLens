"""
Scraping Service for portfolio URLs.

This module provides functionality to capture images from portfolio websites
for AI-powered analysis. Works WITHOUT Playwright by extracting images from HTML.
"""

import os
import uuid
import asyncio
import urllib.request
import urllib.error
import re
import ssl
from typing import List, Optional


async def capture_portfolio_screenshots(url: str, output_dir: str) -> List[str]:
    """
    Capture/extract images from a portfolio URL.
    
    This works WITHOUT Playwright by:
    1. Fetching the HTML page
    2. Extracting image URLs from <img> tags and meta tags
    3. Downloading the most relevant images
    
    Args:
        url: The portfolio URL to capture
        output_dir: Directory to save images in
        
    Returns:
        List of paths to captured images
    """
    print(f"Extracting images from {url}...")
    os.makedirs(output_dir, exist_ok=True)
    image_paths = []
    
    # Create SSL context that doesn't verify certificates (for reliability)
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    
    try:
        # Fetch page HTML
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            }
        )
        
        with urllib.request.urlopen(req, timeout=15, context=ssl_context) as response:
            html = response.read().decode('utf-8', errors='ignore')
        
        # Extract image URLs
        image_urls = set()
        
        # 1. Open Graph image (usually the best preview)
        og_image = re.search(r'<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']+)["\']', html)
        if og_image:
            image_urls.add(og_image.group(1))
        
        # 2. Twitter card image
        twitter_image = re.search(r'<meta[^>]*name=["\']twitter:image["\'][^>]*content=["\']([^"\']+)["\']', html)
        if twitter_image:
            image_urls.add(twitter_image.group(1))
        
        # 3. All img src tags
        img_tags = re.findall(r'<img[^>]*src=["\']([^"\']+)["\']', html)
        for img_src in img_tags[:20]:  # Limit to 20 images
            if not any(skip in img_src.lower() for skip in ['icon', 'logo', 'avatar', 'tracking', '1x1', 'pixel']):
                image_urls.add(img_src)
        
        # 4. Background images in style
        bg_images = re.findall(r'background-image:\s*url\(["\']?([^)"\']+)["\']?\)', html)
        for bg in bg_images[:5]:
            image_urls.add(bg)
        
        print(f"Found {len(image_urls)} potential images")
        
        # Download the best images
        downloaded = 0
        for img_url in list(image_urls)[:8]:  # Limit to 8 images
            try:
                # Resolve relative URLs
                if img_url.startswith('//'):
                    img_url = 'https:' + img_url
                elif img_url.startswith('/'):
                    from urllib.parse import urljoin
                    img_url = urljoin(url, img_url)
                elif not img_url.startswith('http'):
                    from urllib.parse import urljoin
                    img_url = urljoin(url, img_url)
                
                # Skip tiny images and data URIs
                if 'data:image' in img_url:
                    continue
                
                # Fetch image
                img_req = urllib.request.Request(
                    img_url,
                    headers={"User-Agent": "Mozilla/5.0 Chrome/120.0.0.0"}
                )
                
                with urllib.request.urlopen(img_req, timeout=10, context=ssl_context) as img_response:
                    content_type = img_response.headers.get('Content-Type', '')
                    if 'image' not in content_type and 'octet' not in content_type:
                        continue
                    
                    content_length = img_response.headers.get('Content-Length')
                    if content_length and int(content_length) < 5000:  # Skip tiny images
                        continue
                    
                    # Determine extension
                    if 'jpeg' in content_type or 'jpg' in content_type:
                        ext = '.jpg'
                    elif 'png' in content_type:
                        ext = '.png'
                    elif 'webp' in content_type:
                        ext = '.webp'
                    elif 'gif' in content_type:
                        ext = '.gif'
                    else:
                        # Try to get from URL
                        ext = '.jpg'
                        for e in ['.jpg', '.jpeg', '.png', '.webp', '.gif']:
                            if e in img_url.lower():
                                ext = e
                                break
                    
                    # Save image
                    img_path = os.path.join(output_dir, f"img_{uuid.uuid4()}{ext}")
                    img_data = img_response.read()
                    
                    with open(img_path, 'wb') as f:
                        f.write(img_data)
                    
                    image_paths.append(img_path)
                    downloaded += 1
                    print(f"Downloaded image {downloaded}: {img_url[:60]}...")
                    
                    if downloaded >= 5:  # Limit to 5 good images
                        break
                        
            except Exception as e:
                print(f"Failed to download {img_url[:60]}: {e}")
                continue
        
        print(f"Successfully extracted {len(image_paths)} images from {url}")
        
    except Exception as e:
        print(f"Error extracting images from {url}: {e}")
    
    return image_paths


async def get_behance_project_images(url: str) -> List[str]:
    """
    Specialized extractor for Behance which often has lazy-loaded images.
    """
    return await capture_portfolio_screenshots(url, os.path.join("./uploads", "scraping"))
