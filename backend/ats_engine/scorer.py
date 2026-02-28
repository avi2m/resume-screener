"""
ATS Engine - Core keyword analysis and scoring logic
"""
import re
import math
from typing import Dict, List, Tuple, Set
from collections import Counter


# Comprehensive skill taxonomy
SKILL_CATEGORIES = {
    "programming_languages": [
        "python", "java", "javascript", "typescript", "c++", "c#", "ruby", "go", "rust",
        "kotlin", "swift", "php", "scala", "r", "matlab", "perl", "bash", "shell",
        "powershell", "dart", "lua", "haskell", "clojure", "elixir", "erlang"
    ],
    "web_frameworks": [
        "react", "angular", "vue", "next.js", "nuxt", "svelte", "django", "flask",
        "fastapi", "spring", "express", "node.js", "rails", "laravel", "asp.net",
        "gatsby", "remix", "nestjs", "fastify"
    ],
    "databases": [
        "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch", "cassandra",
        "dynamodb", "sqlite", "oracle", "mssql", "neo4j", "couchdb", "firebase",
        "supabase", "snowflake", "bigquery", "redshift"
    ],
    "cloud_devops": [
        "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
        "jenkins", "github actions", "circleci", "gitlab ci", "helm", "prometheus",
        "grafana", "datadog", "elk stack", "linux", "nginx", "apache"
    ],
    "data_ml": [
        "machine learning", "deep learning", "nlp", "computer vision", "tensorflow",
        "pytorch", "scikit-learn", "pandas", "numpy", "spark", "hadoop", "kafka",
        "airflow", "dbt", "tableau", "power bi", "matplotlib", "seaborn", "keras",
        "hugging face", "langchain", "openai", "llm", "transformers"
    ],
    "soft_skills": [
        "leadership", "communication", "teamwork", "problem solving", "critical thinking",
        "project management", "agile", "scrum", "kanban", "collaboration", "mentoring",
        "presentation", "analytical", "time management", "adaptability"
    ],
    "certifications": [
        "aws certified", "google certified", "azure certified", "pmp", "cissp", "cpa",
        "cfa", "scrum master", "product owner", "itil", "six sigma", "comptia"
    ]
}

# Education keywords
EDUCATION_KEYWORDS = [
    "bachelor", "master", "phd", "doctorate", "associate", "degree", "b.s.", "m.s.",
    "b.e.", "m.e.", "b.tech", "m.tech", "mba", "computer science", "engineering",
    "information technology", "data science", "mathematics", "statistics", "physics"
]

# Experience indicators
EXPERIENCE_KEYWORDS = [
    "years of experience", "year experience", "years experience", "senior", "junior",
    "lead", "principal", "staff", "architect", "manager", "director", "vp", "cto", "ceo"
]

# ATS-friendly formatting signals
FORMATTING_SIGNALS = {
    "good": [
        r'\b(experience|education|skills|summary|objective|projects|achievements|certifications)\b',
        r'\b(20\d{2}|19\d{2})\b',  # Years
        r'\b\d+\s*\+?\s*years?\b',  # Years of experience
        r'[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}',  # Email
        r'\+?[\d\s\-().]{10,}',  # Phone number
        r'github\.com|linkedin\.com|portfolio',  # Links
    ],
    "bad": [
        r'[^\x00-\x7F]',  # Non-ASCII characters (tables, special chars)
    ]
}


def preprocess_text(text: str) -> str:
    """Clean and normalize text for analysis."""
    text = text.lower()
    text = re.sub(r'[^\w\s\+#\.]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def extract_keywords_from_text(text: str) -> List[str]:
    """Extract meaningful keywords from text using simple NLP."""
    processed = preprocess_text(text)
    
    # Multi-word phrases first (order matters)
    all_skills = []
    for category, skills in SKILL_CATEGORIES.items():
        for skill in skills:
            if skill in processed:
                all_skills.append(skill)
    
    # Also extract capitalized terms and technical words
    words = re.findall(r'\b[a-z][a-z0-9+#.]*\b', processed)
    
    return list(set(all_skills))


def calculate_keyword_match(resume_text: str, job_description: str) -> Dict:
    """Calculate keyword matching between resume and job description."""
    resume_lower = preprocess_text(resume_text)
    jd_lower = preprocess_text(job_description)
    
    # Extract all significant words from JD (length > 2, not stopwords)
    stopwords = {
        'the', 'and', 'for', 'with', 'you', 'are', 'will', 'have', 'our', 'this',
        'that', 'from', 'they', 'their', 'into', 'been', 'can', 'its', 'was', 'were',
        'has', 'had', 'but', 'not', 'all', 'any', 'both', 'each', 'few', 'more',
        'most', 'other', 'some', 'such', 'than', 'too', 'very', 'just', 'about',
        'also', 'what', 'when', 'who', 'how', 'your', 'work', 'team', 'well', 'good'
    }
    
    # Extract JD keywords (single words)
    jd_words = set(w for w in re.findall(r'\b[a-z][a-z0-9+#.]{2,}\b', jd_lower) 
                   if w not in stopwords)
    
    # Extract multi-word skill phrases from JD
    jd_skills = set()
    for category, skills in SKILL_CATEGORIES.items():
        for skill in skills:
            if skill in jd_lower:
                jd_skills.add(skill)
    
    # Combine important keywords
    important_jd_keywords = jd_skills | {w for w in jd_words if len(w) > 3}
    
    # Check which are in resume
    matched = set()
    missing = set()
    
    for keyword in important_jd_keywords:
        if keyword in resume_lower:
            matched.add(keyword)
        else:
            missing.add(keyword)
    
    # Sort by relevance (skills first, then alphabetically)
    matched_list = sorted(matched, key=lambda x: (0 if x in jd_skills else 1, x))
    missing_list = sorted(missing, key=lambda x: (0 if x in jd_skills else 1, x))
    
    match_rate = len(matched) / max(len(important_jd_keywords), 1)
    
    return {
        "matched_keywords": matched_list[:30],
        "missing_keywords": missing_list[:30],
        "total_jd_keywords": len(important_jd_keywords),
        "matched_count": len(matched),
        "match_rate": match_rate
    }


def calculate_skills_match(resume_text: str, job_description: str) -> Dict:
    """Categorized skills analysis."""
    resume_lower = preprocess_text(resume_text)
    jd_lower = preprocess_text(job_description)
    
    results = {}
    overall_matched = 0
    overall_total = 0
    
    for category, skills in SKILL_CATEGORIES.items():
        jd_skills = [s for s in skills if s in jd_lower]
        if not jd_skills:
            continue
            
        resume_skills = [s for s in jd_skills if s in resume_lower]
        
        results[category] = {
            "required": jd_skills,
            "matched": resume_skills,
            "missing": [s for s in jd_skills if s not in resume_skills],
            "score": len(resume_skills) / len(jd_skills) if jd_skills else 0
        }
        
        overall_matched += len(resume_skills)
        overall_total += len(jd_skills)
    
    return {
        "categories": results,
        "overall_skills_match": overall_matched / max(overall_total, 1),
        "total_required_skills": overall_total,
        "total_matched_skills": overall_matched
    }


def calculate_experience_score(resume_text: str, job_description: str) -> Dict:
    """Analyze experience relevance."""
    resume_lower = resume_text.lower()
    jd_lower = job_description.lower()
    
    # Extract required years from JD
    jd_years_match = re.search(r'(\d+)\+?\s*(?:to\s*\d+)?\s*years?\s*(?:of\s*)?experience', jd_lower)
    required_years = int(jd_years_match.group(1)) if jd_years_match else 0
    
    # Extract candidate years from resume
    resume_years_matches = re.findall(r'(\d+)\+?\s*years?\s*(?:of\s*)?experience', resume_lower)
    candidate_years = max([int(y) for y in resume_years_matches], default=0)
    
    # Count job titles and roles
    seniority_levels = {
        "executive": ["cto", "ceo", "vp", "vice president", "director"],
        "senior": ["senior", "lead", "principal", "staff", "architect"],
        "mid": ["engineer", "developer", "analyst", "designer", "manager"],
        "junior": ["junior", "associate", "intern", "entry"]
    }
    
    resume_seniority = "mid"
    for level, keywords in seniority_levels.items():
        if any(kw in resume_lower for kw in keywords):
            resume_seniority = level
            break
    
    # Score calculation
    if required_years == 0:
        years_score = 0.8
    elif candidate_years >= required_years:
        years_score = 1.0
    elif candidate_years > 0:
        years_score = min(candidate_years / required_years, 1.0)
    else:
        years_score = 0.5  # Can't determine, neutral
    
    return {
        "required_years": required_years,
        "candidate_years": candidate_years,
        "seniority_level": resume_seniority,
        "experience_score": years_score
    }


def calculate_education_score(resume_text: str, job_description: str) -> Dict:
    """Analyze education relevance."""
    resume_lower = resume_text.lower()
    jd_lower = job_description.lower()
    
    degree_hierarchy = {
        "phd": 4, "doctorate": 4, "doctoral": 4,
        "master": 3, "m.s.": 3, "m.e.": 3, "mba": 3,
        "bachelor": 2, "b.s.": 2, "b.e.": 2, "b.tech": 2,
        "associate": 1, "diploma": 1
    }
    
    # Find highest degree in resume
    resume_degree_level = 0
    resume_degree = "Not specified"
    for degree, level in degree_hierarchy.items():
        if degree in resume_lower and level > resume_degree_level:
            resume_degree_level = level
            resume_degree = degree.title()
    
    # Find required degree in JD
    required_degree_level = 0
    required_degree = "Not specified"
    for degree, level in degree_hierarchy.items():
        if degree in jd_lower and level > required_degree_level:
            required_degree_level = level
            required_degree = degree.title()
    
    # Check relevant fields
    relevant_fields = [
        "computer science", "software engineering", "information technology",
        "data science", "mathematics", "statistics", "engineering", "physics"
    ]
    field_match = any(field in resume_lower for field in relevant_fields)
    
    if required_degree_level == 0:
        education_score = 0.8
    elif resume_degree_level >= required_degree_level:
        education_score = 1.0 if field_match else 0.9
    elif resume_degree_level > 0:
        education_score = 0.6
    else:
        education_score = 0.4
    
    return {
        "resume_degree": resume_degree,
        "required_degree": required_degree,
        "field_match": field_match,
        "education_score": education_score
    }


def calculate_formatting_score(resume_text: str) -> Dict:
    """Assess resume formatting for ATS compatibility."""
    score = 1.0
    issues = []
    positives = []
    
    # Check length (optimal: 300-800 words)
    word_count = len(resume_text.split())
    if word_count < 100:
        score -= 0.3
        issues.append("Resume is too short (less than 100 words)")
    elif word_count < 200:
        score -= 0.1
        issues.append("Resume could be more detailed")
    elif word_count > 1500:
        score -= 0.1
        issues.append("Resume may be too long for ATS parsing")
    else:
        positives.append(f"Good length ({word_count} words)")
    
    # Check for contact info
    has_email = bool(re.search(r'[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}', resume_text))
    has_phone = bool(re.search(r'\+?[\d\s\-().]{10,}', resume_text))
    
    if has_email:
        positives.append("Email address present")
    else:
        score -= 0.1
        issues.append("No email address found")
    
    if has_phone:
        positives.append("Phone number present")
    else:
        score -= 0.05
        issues.append("No phone number found")
    
    # Check for key sections
    text_lower = resume_text.lower()
    sections = {
        "experience": ["experience", "work history", "employment"],
        "education": ["education", "academic"],
        "skills": ["skills", "technical skills", "competencies"],
        "summary": ["summary", "objective", "profile", "about me"]
    }
    
    for section, keywords in sections.items():
        if any(kw in text_lower for kw in keywords):
            positives.append(f"'{section.title()}' section found")
        else:
            score -= 0.05
            issues.append(f"Missing '{section.title()}' section")
    
    # Check for dates (important for ATS)
    has_dates = bool(re.search(r'\b(20\d{2}|19\d{2})\b', resume_text))
    if has_dates:
        positives.append("Employment dates present")
    else:
        score -= 0.1
        issues.append("No employment dates found")
    
    return {
        "formatting_score": max(score, 0),
        "issues": issues,
        "positives": positives,
        "word_count": word_count
    }


def calculate_ats_score(
    keyword_match: Dict,
    skills_match: Dict,
    experience: Dict,
    education: Dict,
    formatting: Dict
) -> Dict:
    """
    Calculate final ATS score with weighted components.
    
    Weights:
    - Keywords: 35%
    - Skills: 30%
    - Experience: 20%
    - Education: 10%
    - Formatting: 5%
    """
    weights = {
        "keywords": 0.35,
        "skills": 0.30,
        "experience": 0.20,
        "education": 0.10,
        "formatting": 0.05
    }
    
    scores = {
        "keywords": keyword_match["match_rate"],
        "skills": skills_match["overall_skills_match"],
        "experience": experience["experience_score"],
        "education": education["education_score"],
        "formatting": formatting["formatting_score"]
    }
    
    # Weighted total
    total = sum(scores[k] * weights[k] for k in weights)
    total_percent = round(total * 100)
    
    # Grade
    if total_percent >= 85:
        grade = "Excellent"
        grade_color = "success"
    elif total_percent >= 70:
        grade = "Good"
        grade_color = "info"
    elif total_percent >= 55:
        grade = "Fair"
        grade_color = "warning"
    else:
        grade = "Needs Work"
        grade_color = "danger"
    
    return {
        "total_score": total_percent,
        "grade": grade,
        "grade_color": grade_color,
        "component_scores": {k: round(v * 100) for k, v in scores.items()},
        "weights": {k: int(v * 100) for k, v in weights.items()}
    }
