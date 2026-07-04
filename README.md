# 📄 AI Resume Analyzer

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License: MIT" />
</p>

> A production-ready, full-stack web application that leverages artificial intelligence to analyze resumes, match them against job descriptions, and provide actionable insights such as ATS scores, skill gap analysis, and tailored optimization suggestions.

## 📖 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Quick Start with Docker](#-quick-start-with-docker)
- [💻 Manual Setup](#-manual-setup)
- [⚙️ Environment Variables](#️-environment-variables)
- [🔌 API Endpoints](#-api-endpoints)
- [🧠 Using Local LLM (Ollama)](#-using-local-llm-ollama)
- [🔒 Security Features](#-security-features)
- [🧪 Testing & Seed Data](#-testing--seed-data)
- [📜 License](#-license)

## ✨ Features

- **🔐 Authentication:** Secure JWT-based register, login, and logout with bcrypt password hashing.
- **📄 Resume Upload:** Seamless PDF & DOCX upload with automatic, precise text extraction and section parsing.
- **🤖 AI Analysis:** Get an intelligent ATS score (0–100) backed by an 8-category breakdown.
- **🎯 Job Matching:** Intelligently compare resumes against job descriptions to identify skill gaps.
- **📊 Interactive Dashboard:** Visualize data through interactive charts (ATS trend, skill distribution, and radar charts).
- **✨ Resume Optimizer:** Generate AI-driven improved resume sections to increase ATS success.
- **✉️ Cover Letter Generator:** Automatically draft cover letters tailored to the targeted job description.
- **🎙️ Interview Prep:** Practice with AI-generated interview questions customized to the applicant's profile.
- **👨‍💻 Admin Panel:** Efficient user management and comprehensive platform analytics.
- **📉 PDF Reports:** Easily download beautifully formatted analysis reports.
- **🌓 Dark/Light Mode:** Integrated theme toggle with persistent user preference.

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, React Router, Axios, Recharts |
| **Backend** | Python, FastAPI, SQLAlchemy, Pydantic, JWT Auth |
| **Database** | PostgreSQL 16 |
| **AI Integration** | OpenAI API / Local Ollama (Llama 3.1) |
| **Document Parsing**| `pdfplumber`, `PyMuPDF`, `python-docx` |
| **DevOps** | Docker, Docker Compose, GitHub Actions |

## 📁 Project Structure

```text
AI-Resume-Analyzer/
├── frontend/          # React + TypeScript frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Application views
│   │   ├── hooks/       # Custom React hooks
│   │   ├── services/    # API interaction layer
│   │   ├── types/       # TypeScript type definitions
│   │   └── utils/       # Utility functions
│   └── Dockerfile
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── routes/      # API endpoints
│   │   ├── models/      # SQLAlchemy database models
│   │   ├── schemas/     # Pydantic validation schemas
│   │   ├── services/    # Business logic & AI integration
│   │   └── auth/        # Authentication logic
│   ├── alembic/         # Database migrations
│   ├── tests/           # Pytest suite
│   └── Dockerfile
├── docker-compose.yml   # Multi-container orchestration
└── .github/workflows/   # CI/CD pipelines
```

## 🚀 Quick Start with Docker

```bash
# Clone the repository and navigate to the project directory
git clone https://github.com/yourusername/AI-Resume-Analyzer.git
cd AI-Resume-Analyzer

# (Optional) Set your OpenAI API key for advanced AI features.
# Fallback analysis works without it.
echo "OPENAI_API_KEY=your-key-here" > .env

# Build and start all services using Docker Compose
docker-compose up --build
```

- **Frontend:** http://localhost
- **Backend API:** http://localhost:8000
- **API Docs (Swagger UI):** http://localhost:8000/docs
- **Default Admin Credentials:** `admin@resumeanalyzer.com` / `Admin@123456`

## 💻 Manual Setup

### Prerequisites

- Node.js 20+
- Python 3.12+
- PostgreSQL 16+

### Backend Setup

```bash
cd backend
python -m venv venv

# Activate Virtual Environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Important: Edit .env to set your DATABASE_URL and OPENAI_API_KEY

# Run database migrations
alembic upgrade head

# (Optional) Seed the database with sample users
python tests/seed_data.py

# Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install Node modules
npm install

# Setup environment variables
cp .env.example .env

# Start the Vite development server
npm run dev
```
Open http://localhost:5173 in your browser.

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/resume_analyzer` |
| `SECRET_KEY` | JWT signing key | *Change in production!* |
| `OPENAI_API_KEY` | OpenAI API key | *None* |
| `AI_PROVIDER` | AI backend to use (`openai` or `ollama`) | `openai` |
| `OLLAMA_BASE_URL` | Local Ollama server URL | `http://localhost:11434` |
| `CORS_ORIGINS` | Allowed frontend origins (CORS) | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (e.g., `http://localhost:8000/api`) |

## 🔌 API Endpoints

A detailed API documentation is available via Swagger UI at `/docs` when the backend is running.

### Key Routes
- **Authentication:** `POST /register`, `POST /login`, `POST /logout`, `GET /profile`
- **Resume Management:** `POST /upload-resume`, `GET /resume/{id}`, `DELETE /resume/{id}`
- **AI Analysis:** `POST /analyze`, `POST /compare`, `GET /history`
- **Admin:** `GET /dashboard`, `GET /admin/users`, `GET /admin/analytics`

> Note: Endpoints are available under the `/api/` prefix (e.g., `/api/register`).

## 🧠 Using Local LLM (Ollama)

For a fully private, offline AI analysis experience, you can use Ollama.

```bash
# 1. Install Ollama and pull the Llama 3.1 model
ollama pull llama3.1
ollama serve

# 2. Update backend/.env
AI_PROVIDER=ollama
OLLAMA_MODEL=llama3.1
```

## 🔒 Security Features

- Secure JWT authentication with strict token revocation capabilities.
- Strong bcrypt password hashing.
- Comprehensive request payload validation via Pydantic.
- Secure file upload handling (type and size validation).
- Protection against SQL injection via SQLAlchemy ORM.
- Configured CORS policies for safe cross-origin interactions.
- Role-based Access Control (RBAC) protecting admin-only routes.

## 🧪 Testing & Seed Data

### Running Tests

```bash
# Backend Testing
cd backend
pytest tests/ -v

# Frontend Build Verification
cd frontend
npm run build
```

### Seeding Data

After initializing the backend database, populate it with test users:

```bash
python backend/tests/seed_data.py
```
**Sample Users Created:**
- `john.doe@example.com` / `Password@123`
- `jane.smith@example.com` / `Password@123`

## 📜 License

This project is licensed under the **MIT License** — perfectly suited for academic capstone projects, portfolio enhancements, and open-source contributions.
