import os
import uuid
import aiofiles
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.models.models import Portfolio, PortfolioFile, SourceType, PortfolioStatus
from app.schemas.schemas import (
    PortfolioResponse,
    PortfolioListResponse,
    PortfolioURLSubmit,
)
from app.core.security import get_current_user_id
from app.core.config import settings

router = APIRouter(prefix="/portfolios", tags=["Portfolios"])


@router.get("", response_model=List[PortfolioListResponse])
async def list_portfolios(
    context: Optional[str] = None,  # 'designer' or 'recruiter' filter
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """List portfolios for the current user, optionally filtered by submission context."""
    query = select(Portfolio).where(Portfolio.user_id == user_id)
    
    # Filter by submission context if provided
    if context and context in ["designer", "recruiter"]:
        query = query.where(Portfolio.submission_context == context)
    
    result = await db.execute(
        query
        .options(selectinload(Portfolio.analysis))
        .order_by(Portfolio.created_at.desc())
    )
    portfolios = result.scalars().all()
    return [PortfolioListResponse.model_validate(p) for p in portfolios]


@router.get("/{portfolio_id}", response_model=PortfolioResponse)
async def get_portfolio(
    portfolio_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific portfolio."""
    result = await db.execute(
        select(Portfolio)
        .where(Portfolio.id == portfolio_id, Portfolio.user_id == user_id)
        .options(selectinload(Portfolio.analysis))
    )
    portfolio = result.scalar_one_or_none()
    
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found",
        )
    
    return PortfolioResponse.model_validate(portfolio)


@router.post("/upload", response_model=PortfolioResponse, status_code=status.HTTP_201_CREATED)
async def upload_portfolio(
    files: List[UploadFile] = File(...),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Upload portfolio files (images, PDFs)."""
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files provided",
        )
    
    # Validate file types
    allowed_types = {"image/png", "image/jpeg", "image/webp", "application/pdf"}
    for file in files:
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type not allowed: {file.content_type}",
            )
    
    # Create portfolio
    portfolio = Portfolio(
        user_id=user_id,
        title=files[0].filename if files else "Uploaded Portfolio",
        source_type=SourceType.FILE,
        status=PortfolioStatus.PENDING,
    )
    db.add(portfolio)
    await db.flush()
    
    # Create upload directory
    upload_dir = os.path.join(settings.upload_dir, str(portfolio.id))
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save files
    for file in files:
        file_ext = os.path.splitext(file.filename)[1]
        file_name = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(upload_dir, file_name)
        
        async with aiofiles.open(file_path, "wb") as f:
            content = await file.read()
            await f.write(content)
        
        # Determine file type category
        file_type = "image" if file.content_type.startswith("image/") else "pdf"
        
        portfolio_file = PortfolioFile(
            portfolio_id=portfolio.id,
            file_type=file_type,
            file_path=file_path,
            original_name=file.filename,
        )
        db.add(portfolio_file)
    
    await db.commit()
    
    # Re-fetch with analysis relationship to avoid lazy loading issues
    result = await db.execute(
        select(Portfolio)
        .where(Portfolio.id == portfolio.id)
        .options(selectinload(Portfolio.analysis))
    )
    portfolio = result.scalar_one()
    return PortfolioResponse.model_validate(portfolio)


@router.post("/url", response_model=PortfolioResponse, status_code=status.HTTP_201_CREATED)
async def submit_portfolio_url(
    data: PortfolioURLSubmit,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Submit a portfolio URL for analysis."""
    # Determine source type
    source_type = SourceType.URL
    if "behance.net" in data.url.lower():
        source_type = SourceType.BEHANCE
    
    portfolio = Portfolio(
        user_id=user_id,
        title=data.title,
        source_type=source_type,
        source_url=data.url,
        status=PortfolioStatus.PENDING,
        submission_context=data.submission_context or "designer",
        candidate_name=data.candidate_name,
    )
    db.add(portfolio)
    await db.commit()
    
    # Re-fetch with analysis relationship to avoid lazy loading issues in async context
    result = await db.execute(
        select(Portfolio)
        .where(Portfolio.id == portfolio.id)
        .options(selectinload(Portfolio.analysis))
    )
    portfolio = result.scalar_one()
    return PortfolioResponse.model_validate(portfolio)


@router.delete("/{portfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_portfolio(
    portfolio_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Delete a portfolio."""
    result = await db.execute(
        select(Portfolio)
        .where(Portfolio.id == portfolio_id, Portfolio.user_id == user_id)
    )
    portfolio = result.scalar_one_or_none()
    
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found",
        )
    
    await db.delete(portfolio)
    return None
