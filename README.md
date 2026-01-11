# PortLens: The Elite Design Intelligence Platform

> **"No Competition."** — *AI-Powered Portfolio Analysis for Top-Tier Design Talent & Recruiters.*

PortLens is a sophisticated SaaS platform that bridges the gap between creative talent and recruitment. It uses an **Elite Design Analysis Engine** to critique portfolios with the rigor of a Senior Art Director, checking for Gestalt principles, WCAG accessibility, and Golden Ratio harmony in under 5 seconds.


## Key Features

### For Designers: The "Elite Critique"
- **Instant Analysis**: Get a comprehensive review of your link in < 4 seconds.
- **Senior-Level Feedback**: Our engine evaluates:
  - **Visuals**: Typographic rhythm, grid usage, negative space, color theory.
  - **UX**: User journey maps, interaction cost, heuristic usability.
  - **Storytelling**: STAR method application, KPI impact.
- **Growth Roadmap**: Actionable steps to move from "Junior" to "Senior".

### For Recruiters: The "Enterprise View"
- **One-Glance Verdicts**: Instant "Hire", "Strong Hire", or "Pass" badges.
- **Batch Processing**: Import 100+ links via CSV and rank them automatically.
- **Skill Breakdown**: Radar charts comparing Visuals vs. UX vs. Communication.

---

## Architecture

Built for **Speed** and **Stability**.

| Layer | Technology | Highlights |
|-------|------------|------------|
| **Frontend** | React 18 + Vite | Glassmorphism UI, Recharts, Framer Motion |
| **Backend** | FastAPI (Python 3.12) | AsyncIO, SQLAlchemy, Pydantic |
| **Analysis** | PortLens-Enterprise-v1 | Custom heuristic engine (No external API dependency for stability) |
| **Database** | PostgreSQL / SQLite | Robust session management |
| **Deploy** | Vercel (FE) + Railway (BE) | CI/CD automated pipeline |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/shriiyyaa/PortLens.git
   cd PortLens
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   
   pip install -r requirements.txt
   
   # Run the server
   python -m app.main
   ```
   *Server runs at `http://localhost:8000`*

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Run the development server
   npm run dev
   ```
   *App runs at `http://localhost:5173`*

---

## The "Elite" Engine

PortLens doesn't just "guess". It uses a deterministic, rule-based heuristic engine enhanced with **Dynamic Keyword Extraction**.

- **Context Aware**: It reads the portfolio's meta-description to understand if the candidate is a "Minimalist UI Designer" or a "Data-Heavy UX Researcher".
- **Vocabulary**: It speaks the language of design (`"Kerning"`, `"Affordance"`, `"Cognitive Load"`).

## License

MIT © [Shriya Nayyar](https://github.com/shriiyyaa)
