# PortLens Deployment Guide

## Quick Deployment Options

### Option 1: Docker Compose (Recommended for Self-Hosting)
```bash
cd c:\Users\nayya\portlens
docker-compose up -d
```
Then access at: `http://localhost:5173`

### Option 2: Cloud Deployment

#### Frontend → Vercel (Free)
1. Go to [vercel.com](https://vercel.com)
2. Connect your GitHub repo
3. Set root directory: `frontend`
4. Set build command: `npm run build`
5. Set output: `dist`
6. Add env variable: `VITE_API_URL=https://your-backend-url.com`

#### Backend → Railway/Render (Free tier available)
1. Go to [railway.app](https://railway.app) or [render.com](https://render.com)
2. Create new project from GitHub
3. Set root directory: `backend`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables:
   - `DATABASE_URL` (Railway provides Postgres automatically)
   - `JWT_SECRET_KEY` (generate a secure random string)
   - `FRONTEND_URL` (your Vercel URL)

## Environment Variables Needed

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@host:5432/portlens
JWT_SECRET_KEY=your-super-secret-key-here
FRONTEND_URL=https://your-frontend-url.com
OPENAI_API_KEY=your-openai-key (for AI analysis)
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend-url.com
```

## Build Outputs
- Frontend: `frontend/dist/` (static files ready for hosting)
- Backend: Python app ready for uvicorn

## Current Status
✅ Frontend build: Complete (289KB gzip)
✅ Backend: Ready
✅ Docker Compose: Pre-configured
