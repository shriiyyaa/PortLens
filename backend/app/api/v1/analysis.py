from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.models.models import Portfolio, Analysis, PortfolioStatus
from app.schemas.schemas import AnalysisResponse, AnalysisStatusResponse
from app.core.security import get_current_user_id
from app.services.ai_service import analyze_portfolio

router = APIRouter(prefix="/analysis", tags=["Analysis"])


@router.post("/{portfolio_id}/start", response_model=AnalysisStatusResponse)
async def start_analysis(
    portfolio_id: str,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Start analysis for a portfolio."""
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
    
    if portfolio.status == PortfolioStatus.PROCESSING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Analysis already in progress",
        )
    
    # Update status to processing
    portfolio.status = PortfolioStatus.PROCESSING
    await db.flush()
    
    # Queue analysis in background
    background_tasks.add_task(analyze_portfolio, str(portfolio.id))
    
    return AnalysisStatusResponse(
        portfolio_id=portfolio.id,
        status=portfolio.status,
        progress=0,
        message="Analysis started",
    )


@router.get("/{portfolio_id}/status", response_model=AnalysisStatusResponse)
async def get_analysis_status(
    portfolio_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get the status of an analysis."""
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
    
    progress = None
    message = None
    
    if portfolio.status == PortfolioStatus.PENDING:
        message = "Waiting to start"
    elif portfolio.status == PortfolioStatus.PROCESSING:
        message = "Analysis in progress"
        progress = 50
    elif portfolio.status == PortfolioStatus.COMPLETED:
        message = "Analysis complete"
        progress = 100
    elif portfolio.status == PortfolioStatus.FAILED:
        message = "Analysis failed"
        progress = 0
    
    return AnalysisStatusResponse(
        portfolio_id=portfolio.id,
        status=portfolio.status,
        progress=progress,
        message=message,
    )


@router.get("/{portfolio_id}/results", response_model=AnalysisResponse)
async def get_analysis_results(
    portfolio_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get the results of an analysis."""
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
    
    if not portfolio.analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found",
        )
    
    return AnalysisResponse.model_validate(portfolio.analysis)
