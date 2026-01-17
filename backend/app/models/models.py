import uuid
from datetime import datetime
from enum import Enum
from typing import Optional, List
from sqlalchemy import String, Text, Float, DateTime, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class UserRole(str, Enum):
    """User roles."""
    DESIGNER = "designer"
    RECRUITER = "recruiter"
    ADMIN = "admin"


class PortfolioStatus(str, Enum):
    """Portfolio processing status."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class SourceType(str, Enum):
    """Portfolio source types."""
    URL = "url"
    FILE = "file"
    BEHANCE = "behance"


class User(Base):
    """User model."""
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), default=UserRole.DESIGNER, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    portfolios: Mapped[List["Portfolio"]] = relationship("Portfolio", back_populates="user", cascade="all, delete-orphan")
    batches: Mapped[List["Batch"]] = relationship("Batch", back_populates="recruiter", cascade="all, delete-orphan")


class SubmissionContext(str, Enum):
    """Context in which portfolio was submitted."""
    DESIGNER = "designer"  # Designer submitting their own work for feedback
    RECRUITER = "recruiter"  # Recruiter submitting a candidate for evaluation


class Portfolio(Base):
    """Portfolio model."""
    __tablename__ = "portfolios"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    source_type: Mapped[SourceType] = mapped_column(SQLEnum(SourceType), nullable=False)
    source_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[PortfolioStatus] = mapped_column(SQLEnum(PortfolioStatus), default=PortfolioStatus.PENDING)
    submission_context: Mapped[Optional[str]] = mapped_column(String(20), default="designer", nullable=True)  # 'designer' or 'recruiter'
    candidate_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)  # For recruiter submissions
    metadata_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="portfolios")
    files: Mapped[List["PortfolioFile"]] = relationship("PortfolioFile", back_populates="portfolio", cascade="all, delete-orphan")
    analysis: Mapped[Optional["Analysis"]] = relationship("Analysis", back_populates="portfolio", uselist=False, cascade="all, delete-orphan")


class PortfolioFile(Base):
    """Portfolio file model."""
    __tablename__ = "portfolio_files"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    portfolio_id: Mapped[str] = mapped_column(String(36), ForeignKey("portfolios.id"), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)
    file_path: Mapped[str] = mapped_column(Text, nullable=False)
    original_name: Mapped[str] = mapped_column(String(255), nullable=False)
    extracted_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    portfolio: Mapped["Portfolio"] = relationship("Portfolio", back_populates="files")


class Analysis(Base):
    """Analysis model."""
    __tablename__ = "analyses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    portfolio_id: Mapped[str] = mapped_column(String(36), ForeignKey("portfolios.id"), unique=True, nullable=False)
    visual_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    ux_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    communication_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    overall_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    hireability_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    recruiter_verdict: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    strengths: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    weaknesses: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    recommendations: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    raw_response: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    portfolio: Mapped["Portfolio"] = relationship("Portfolio", back_populates="analysis")
    evidence: Mapped[List["Evidence"]] = relationship("Evidence", back_populates="analysis", cascade="all, delete-orphan")


class Evidence(Base):
    """Evidence model for analysis supporting data."""
    __tablename__ = "evidence"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_id: Mapped[str] = mapped_column(String(36), ForeignKey("analyses.id"), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    evidence_type: Mapped[str] = mapped_column(String(50), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    impact_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    analysis: Mapped["Analysis"] = relationship("Analysis", back_populates="evidence")


class Batch(Base):
    """Batch model for recruiter bulk uploads."""
    __tablename__ = "batches"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    recruiter_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    total_count: Mapped[int] = mapped_column(default=0)
    completed_count: Mapped[int] = mapped_column(default=0)
    status: Mapped[PortfolioStatus] = mapped_column(SQLEnum(PortfolioStatus), default=PortfolioStatus.PENDING)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    recruiter: Mapped["User"] = relationship("User", back_populates="batches")
    items: Mapped[List["BatchItem"]] = relationship("BatchItem", back_populates="batch", cascade="all, delete-orphan")


class BatchItem(Base):
    """Batch item model linking batches to portfolios."""
    __tablename__ = "batch_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    batch_id: Mapped[str] = mapped_column(String(36), ForeignKey("batches.id"), nullable=False)
    portfolio_id: Mapped[str] = mapped_column(String(36), ForeignKey("portfolios.id"), nullable=False)
    rank: Mapped[Optional[int]] = mapped_column(nullable=True)
    recommendation: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    batch: Mapped["Batch"] = relationship("Batch", back_populates="items")
    portfolio: Mapped["Portfolio"] = relationship("Portfolio")
