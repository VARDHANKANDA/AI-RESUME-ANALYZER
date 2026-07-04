# AI Resume Analyzer

A production-ready, full-stack web application that analyzes resumes using AI, compares them with job descriptions, and provides ATS scores, skill matching, improvement suggestions, and resume optimization.

![Tech Stack](https://img.shields.io/badge/React-19-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue) ![Docker](https://img.shields.io/badge/Docker-Ready-blue)

## Features

- **Authentication** — JWT-based register, login, logout with bcrypt password hashing
- **Resume Upload** — PDF/DOCX upload with automatic text extraction and section parsing
- **AI Analysis** — ATS score (0–100) with 8-category breakdown
- **Job Matching** — Compare resume vs job description with skill gap analysis
- **Dashboard** — Interactive charts (ATS trend, skill distribution, radar chart)
- **Resume Optimizer** — AI-generated improved sections
- **Cover Letter Generator** — Tailored cover letters
- **Interview Prep** — AI-generated interview questions
- **Admin Panel** — User management and platform analytics
- **PDF Reports** — Download analysis reports
- **Dark/Light Mode** — Theme toggle with persistent preference

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router, Axios, Recharts |
| Backend | Python, FastAPI, SQLAlchemy, Pydantic, JWT |
| Database | PostgreSQL |
| AI | OpenAI API / Ollama (Llama 3.1) |
| Parsing | pdfplumber, PyMuPDF, python-docx |
| DevOps | Docker, Docker Compose, GitHub Actions |

## Project Structure

```
AI Resume Analyzer/
├── frontend/          # React + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── Dockerfile
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── auth/
│   ├── alembic/
│   ├── tests/
│   └── Dockerfile
├── docker-compose.yml
└── .github/workflows/
```

## Quick Start with Docker

```bash
# Clone and navigate to project
cd "AI Resume Analyzer"

# Set your OpenAI API key (optional — fallback analysis works without it)
# Create .env in project root:
echo "OPENAI_API_KEY=your-key-here" > .env

# Start all services
docker-compose up --build
```

- **Frontend:** http://localhost
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

**Default Admin:** `admin@resumeanalyzer.com` / `Admin@123456`

## Manual Setup

### Prerequisites

- Node.js 20+
- Python 3.12+
- PostgreSQL 16+

### Backend

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your DATABASE_URL and OPENAI_API_KEY

# Run migrations
alembic upgrade head

# Seed sample users (optional)
python tests/seed_data.py

# Start server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/resume_analyzer` |
| `SECRET_KEY` | JWT signing key | Change in production |
| `OPENAI_API_KEY` | OpenAI API key | — |
| `AI_PROVIDER` | `openai` or `ollama` | `openai` |
| `OLLAMA_BASE_URL` | Ollama server URL | `http://localhost:11434` |
| `CORS_ORIGINS` | Allowed frontend origins | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (`http://localhost:8000/api`) |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login and get JWT |
| POST | `/logout` | Revoke token |
| GET | `/profile` | Get user profile |

### Resume
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload-resume` | Upload PDF/DOCX resume |
| GET | `/resume/{id}` | Get resume details |
| DELETE | `/resume/{id}` | Delete resume |

### Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analyze` | Run ATS analysis |
| POST | `/compare` | Compare with job description |
| GET | `/history` | Analysis history |

### Dashboard & Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Dashboard statistics |
| GET | `/admin/users` | List all users (admin) |
| GET | `/admin/analytics` | Platform analytics (admin) |
| DELETE | `/admin/user/{id}` | Delete user (admin) |

> All endpoints are also available under `/api/` prefix (e.g., `/api/register`).

## Using Ollama (Local LLM)

```bash
# Install and run Ollama
ollama pull llama3.1
ollama serve

# Set in backend/.env
AI_PROVIDER=ollama
OLLAMA_MODEL=llama3.1
```

## Running Tests

```bash
# Backend
cd backend
pytest tests/ -v

# Frontend build check
cd frontend
npm run build
```

## Security Features

- JWT authentication with token revocation
- bcrypt password hashing
- Input validation via Pydantic
- File type and size validation
- Rate limiting on health endpoint
- SQL injection protection via SQLAlchemy ORM
- CORS configuration
- Protected and admin-only routes

## Sample Test Data

After starting the backend, run:

```bash
python backend/tests/seed_data.py
```

Creates sample users:
- `john.doe@example.com` / `Password@123`
- `jane.smith@example.com` / `Password@123`

## License

MIT License — suitable for academic capstone projects and portfolio use.
