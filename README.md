# PortLens

> AI-powered Design Intelligence Platform for evaluating creative portfolios

## Project Structure

```
portlens/
├── frontend/          # React + Vite application
├── backend/           # FastAPI application
├── ai_services/       # AI/ML pipeline
├── shared/            # Shared utilities
└── docker-compose.yml # Local development
```

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose

### Development

```bash
# Start all services
docker-compose up -d

# Frontend only (http://localhost:5173)
cd frontend && npm run dev

# Backend only (http://localhost:8000)
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Backend | FastAPI + SQLAlchemy |
| Database | PostgreSQL |
| AI | OpenAI GPT-4V → Custom models |
| Queue | Celery + Redis |

## License

MIT
