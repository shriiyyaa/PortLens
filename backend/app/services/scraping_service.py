"""
Scraping Service for portfolio URLs.

This module provides functionality to capture screenshots of portfolio websites
to be used for AI-powered analysis.
"""

import os
import uuid
import asyncio
from typing import List, Optional
from playwright.async_api import async_playwright

async def capture_portfolio_screenshots(url: str, output_dir: str) -> List[str]:
    """
    Capture multiple screenshots of a portfolio URL.
    
    Args:
        url: The portfolio URL to capture
        output_dir: Directory to save screenshots in
        
    Returns:
        List of paths to captured screenshots
    """
    os.makedirs(output_dir, exist_ok=True)
    screenshot_paths = []
    
    async with async_playwright() as p:
        try:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page(
                viewport={'width': 1280, 'height': 800},
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            
            # Navigate to URL
            print(f"Navigating to {url}...")
            await page.goto(url, wait_until="networkidle", timeout=60000)
            
            # Wait a bit for animations/dynamic content
            await asyncio.sleep(2)
            
            # Take a full page screenshot (or at least a good chunk)
            main_path = os.path.join(output_dir, f"full_{uuid.uuid4()}.png")
            await page.screenshot(path=main_path, full_page=True)
            screenshot_paths.append(main_path)
            
            # Scroll down and take a few more if the page is very long, 
            # but usually full_page=True is enough for Gemini if the height isn't insane.
            # However, Behance/Dribbble pages can be extremely long.
            # Let's take specific chunks if full_page is too large.
            
            await browser.close()
        except Exception as e:
            print(f"Scraping error for {url}: {e}")
            if 'browser' in locals():
                await browser.close()
    
    return screenshot_paths

async def get_behance_project_images(url: str) -> List[str]:
    """
    Specialized extractor for Behance which often has lazy-loaded images.
    """
    # For now, capture_portfolio_screenshots handles it reasonably well with networkidle
    return await capture_portfolio_screenshots(url, os.path.join("./uploads", "scraping"))
