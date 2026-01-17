from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# Convert DATABASE_URL for async drivers
database_url = settings.database_url
if database_url.startswith("postgresql://"):
    # Railway provides postgresql://, but async SQLAlchemy needs postgresql+asyncpg://
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
elif database_url.startswith("postgres://"):
    # Some providers use postgres:// (deprecated but still used)
    database_url = database_url.replace("postgres://", "postgresql+asyncpg://", 1)

# Create async engine
engine = create_async_engine(
    database_url,
    echo=settings.debug,
    future=True,
)

# Create async session factory
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Base class for SQLAlchemy models."""
    pass


async def get_db() -> AsyncSession:
    """Dependency that provides a database session."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Create all database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def run_migrations():
    """Run database migrations to add missing columns.
    
    This is a simple migration system for adding new columns without
    requiring Alembic. For production systems, consider using Alembic.
    """
    from sqlalchemy import text
    
    async with engine.begin() as conn:
        # PostgreSQL-specific: Add columns if they don't exist
        # These are safe to run multiple times due to IF NOT EXISTS
        migrations = [
            # Add submission_context column to portfolios table
            """
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'portfolios' AND column_name = 'submission_context'
                ) THEN
                    ALTER TABLE portfolios ADD COLUMN submission_context VARCHAR(20) DEFAULT 'designer';
                END IF;
            END $$;
            """,
            # Add candidate_name column to portfolios table
            """
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'portfolios' AND column_name = 'candidate_name'
                ) THEN
                    ALTER TABLE portfolios ADD COLUMN candidate_name VARCHAR(255);
                END IF;
            END $$;
            """,
        ]
        
        for migration in migrations:
            try:
                await conn.execute(text(migration))
                print(f"Migration executed successfully")
            except Exception as e:
                print(f"Migration warning (may be SQLite): {e}")
