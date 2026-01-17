from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from enum import Enum


# --- Enums ---
class UserRole(str, Enum):
    DESIGNER = "designer"
    RECRUITER = "recruiter"
    ADMIN = "admin"


class PortfolioStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class SourceType(str, Enum):
    URL = "url"
    FILE = "file"
    BEHANCE = "behance"


# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole = UserRole.DESIGNER


class UserCreate(UserBase):
    password: str = Field(min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class GoogleLoginRequest(BaseModel):
    access_token: str


class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# --- Portfolio Schemas ---
class PortfolioBase(BaseModel):
    title: Optional[str] = None
    source_type: SourceType


class PortfolioCreate(PortfolioBase):
    source_url: Optional[str] = None


class PortfolioURLSubmit(BaseModel):
    url: str
    title: Optional[str] = "Portfolio"
    submission_context: Optional[str] = "designer"  # 'designer' or 'recruiter'
    candidate_name: Optional[str] = None  # For recruiter submissions


# --- Preview Schemas (analyze without saving) ---
class PortfolioURLPreview(BaseModel):
    """Request to preview/analyze a portfolio without saving."""
    url: str
    submission_context: Optional[str] = "designer"


class PreviewAnalysisData(BaseModel):
    """Analysis data returned from preview (not saved to DB yet)."""
    visual_score: Optional[float] = None
    ux_score: Optional[float] = None
    communication_score: Optional[float] = None
    overall_score: Optional[float] = None
    hireability_score: Optional[float] = None
    recruiter_verdict: Optional[str] = None
    seniority_assessment: Optional[str] = None
    industry_benchmark: Optional[str] = None
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None


class PreviewAnalysisResponse(BaseModel):
    """Response for preview analysis (not saved)."""
    url: str
    title: str
    source_type: SourceType
    analysis: PreviewAnalysisData
    ai_generated: bool = False
    model_used: Optional[str] = None


class SavePreviewRequest(BaseModel):
    """Request to save a previewed portfolio to the database."""
    url: str
    title: Optional[str] = "Portfolio"
    source_type: SourceType
    submission_context: Optional[str] = "designer"
    candidate_name: Optional[str] = None
    analysis: PreviewAnalysisData


class AnalysisResponse(BaseModel):
    id: str
    visual_score: Optional[float] = None
    ux_score: Optional[float] = None
    communication_score: Optional[float] = None
    overall_score: Optional[float] = None
    hireability_score: Optional[float] = None
    recruiter_verdict: Optional[str] = None
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PortfolioResponse(PortfolioBase):
    id: str
    user_id: str
    source_url: Optional[str] = None
    status: PortfolioStatus
    created_at: datetime
    analysis: Optional[AnalysisResponse] = None

    class Config:
        from_attributes = True


class PortfolioListResponse(BaseModel):
    id: str
    title: Optional[str] = None
    source_type: SourceType
    status: PortfolioStatus
    submission_context: Optional[str] = "designer"
    candidate_name: Optional[str] = None
    created_at: datetime
    analysis: Optional[AnalysisResponse] = None

    class Config:
        from_attributes = True


# --- Analysis Schemas ---
class AnalysisStatusResponse(BaseModel):
    portfolio_id: str
    status: PortfolioStatus
    progress: Optional[int] = None
    message: Optional[str] = None


# --- Recruiter Schemas ---
class BatchCreate(BaseModel):
    name: str
    urls: List[str]


class BatchItemResponse(BaseModel):
    portfolio_id: str
    title: Optional[str] = None
    rank: Optional[int] = None
    recommendation: Optional[str] = None
    overall_score: Optional[float] = None

    class Config:
        from_attributes = True


class BatchResponse(BaseModel):
    id: str
    name: str
    total_count: int
    completed_count: int
    status: PortfolioStatus
    created_at: datetime
    items: Optional[List[BatchItemResponse]] = None

    class Config:
        from_attributes = True


# --- Evidence Schemas ---
class EvidenceResponse(BaseModel):
    id: str
    category: str
    evidence_type: str
    content: str
    impact_score: Optional[float] = None

    class Config:
        from_attributes = True
