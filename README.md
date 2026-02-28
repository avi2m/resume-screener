# ◈ ResumeAI — Automated ATS Resume Screener

An AI-powered resume screening web application that analyzes resumes against job descriptions and provides an ATS compatibility score with detailed improvement suggestions.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+ and pip
- Node.js 18+ and npm
- (Optional) OpenAI API key for GPT-powered suggestions

---

## 📁 Project Structure

```
resume-screener/
├── backend/
│   ├── app.py                  # Flask application entry point
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Environment variable template
│   ├── ats_engine/
│   │   ├── __init__.py
│   │   └── scorer.py           # ATS scoring logic (keywords, skills, experience)
│   ├── ml_engine/
│   │   ├── __init__.py
│   │   └── analyzer.py         # AI/NLP suggestion generator (OpenAI + fallback)
│   ├── text_extractors/
│   │   ├── __init__.py
│   │   ├── pdf_extractor.py    # PDF text extraction (pdfplumber + PyPDF2)
│   │   ├── docx_extractor.py   # DOCX text extraction
│   │   └── extractor_factory.py# Routes to correct extractor
│   ├── models/
│   │   ├── __init__.py
│   │   └── response_models.py  # Response data models
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── resume_routes.py    # /api/resume/* endpoints
│   │   └── health_routes.py    # /api/health endpoint
│   └── utils/
│       ├── __init__.py
│       └── validators.py       # Input validation
│
├── frontend/
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js              # Main app with page routing
│       ├── index.js
│       ├── index.css           # Global design system
│       ├── pages/
│       │   ├── HomePage.js/css     # Landing page
│       │   ├── AnalysisPage.js/css # Upload + job description
│       │   └── ResultsPage.js/css  # Results dashboard
│       └── components/
│           ├── Navbar.js/css
│           ├── ScoreGauge.js/css   # SVG gauge visualization
│           ├── KeywordCloud.js/css # Keyword match visualization
│           ├── SkillsBreakdown.js/css # Skills category analysis
│           └── SuggestionsPanel.js/css # Improvement suggestions
│
├── sample_resume.txt           # Test resume for quick testing
└── README.md
```

---

## ⚙️ Backend Setup

### 1. Navigate to backend directory
```bash
cd resume-screener/backend
```

### 2. Create and activate a virtual environment
```bash
# macOS/Linux
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env`:
```env
# Optional: Add OpenAI API key for GPT-powered suggestions
# Without this, the app uses intelligent rule-based NLP analysis
OPENAI_API_KEY=sk-your-key-here

PORT=5000
FLASK_DEBUG=true
```

### 5. Start the backend server
```bash
python app.py
```

The API will be available at `http://localhost:5000`

**Verify it's running:**
```bash
curl http://localhost:5000/api/health
```

---

## 🎨 Frontend Setup

### 1. Navigate to frontend directory
```bash
cd resume-screener/frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm start
```

The frontend will open at `http://localhost:3000`

---

## 🔌 API Endpoints

### `POST /api/resume/analyze`
Main analysis endpoint.

**Form Data:**
- `resume` — PDF, DOCX, DOC, or TXT file (max 10MB)
- `job_description` — Job description text (min 50 chars)

**Response:**
```json
{
  "success": true,
  "data": {
    "ats_score": {
      "total_score": 78,
      "grade": "Good",
      "component_scores": {
        "keywords": 72,
        "skills": 85,
        "experience": 80,
        "education": 90,
        "formatting": 88
      }
    },
    "keyword_analysis": {
      "matched_keywords": ["python", "react", "aws", ...],
      "missing_keywords": ["kubernetes", "terraform", ...],
      "match_rate": 0.72
    },
    "skills_analysis": { ... },
    "experience_analysis": { ... },
    "education_analysis": { ... },
    "formatting_analysis": { ... },
    "suggestions": {
      "summary": "...",
      "top_suggestions": [...],
      "strengths": [...],
      "quick_wins": [...]
    }
  }
}
```

### `GET /api/health`
Health check endpoint.

### `GET /api/resume/sample`
Returns sample analysis data for testing.

---

## 🧠 ATS Scoring Algorithm

| Component | Weight | What It Measures |
|-----------|--------|-----------------|
| Keywords | 35% | Keyword match between resume and JD |
| Skills | 30% | Technical skills coverage by category |
| Experience | 20% | Years of experience + seniority level |
| Education | 10% | Degree level match |
| Formatting | 5% | ATS-friendly formatting signals |

### Score Grades:
- **85-100**: Excellent 🟢
- **70-84**: Good 🔵
- **55-69**: Fair 🟡
- **0-54**: Needs Work 🔴

---

## 🤖 AI Modes

### Mode 1: OpenAI GPT (with API key)
- Uses `gpt-3.5-turbo` for intelligent, context-aware suggestions
- Provides nuanced job role relevance analysis
- More personalized improvement recommendations

### Mode 2: NLP-Based (no API key required)
- Uses pattern matching, skill taxonomies, and rule-based analysis
- Still provides excellent keyword matching and skills gap analysis
- Includes smart improvement suggestions based on resume patterns
- 100% free to use

---

## 🧪 Testing the App

### Quick test with curl:
```bash
curl -X POST http://localhost:5000/api/resume/analyze \
  -F "resume=@sample_resume.txt" \
  -F "job_description=Senior Python Engineer with React experience and AWS. Need 5+ years, Docker, Kubernetes."
```

### Test with the frontend:
1. Open `http://localhost:3000`
2. Click "Analyze My Resume"
3. Upload `sample_resume.txt`
4. Click "Load Sample" to auto-fill the job description
5. Click "Analyze Resume"

---

## 🚀 Deployment

### Backend (using Gunicorn):
```bash
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

### Frontend (build for production):
```bash
npm run build
# Serve the `build/` directory with any static file server
```

### Environment variables for production:
```env
FLASK_DEBUG=false
OPENAI_API_KEY=your_production_key
PORT=5000
```

---

## 🛠️ Troubleshooting

**"Cannot connect to backend"**
- Ensure the Flask server is running: `python app.py`
- Check it's on port 5000: `curl http://localhost:5000/api/health`

**"Could not extract text from PDF"**
- Ensure the PDF has selectable text (not scanned/image-only)
- Try converting to DOCX or TXT format

**"Job description too short"**
- Provide at least 50 characters
- Include skills, requirements, and responsibilities for best results

**Module not found errors**
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt` again

---

## 📦 Dependencies

### Backend
- **Flask** — Web framework
- **flask-cors** — CORS support for React frontend
- **pdfplumber** — Primary PDF text extraction
- **PyPDF2** — PDF fallback extractor
- **python-docx** — DOCX extraction
- **openai** — Optional GPT integration
- **python-dotenv** — Environment variable management

### Frontend
- **React 18** — UI framework
- **axios** — HTTP client
- **lucide-react** — Icons

---

## 📝 License

MIT License — Free for personal and commercial use.
