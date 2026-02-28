"""
ML Engine - AI-powered resume analysis using OpenAI or fallback NLP
"""
import os
import re
import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)


def generate_ai_suggestions(
    resume_text: str,
    job_description: str,
    ats_score: int,
    missing_keywords: List[str],
    api_key: Optional[str] = None
) -> Dict:
    """
    Generate improvement suggestions using OpenAI if available,
    otherwise use rule-based NLP suggestions.
    """
    if api_key:
        try:
            return _openai_suggestions(resume_text, job_description, ats_score, missing_keywords, api_key)
        except Exception as e:
            logger.warning(f"OpenAI call failed: {e}. Falling back to NLP-based suggestions.")
    
    return _rule_based_suggestions(resume_text, job_description, ats_score, missing_keywords)


def _openai_suggestions(
    resume_text: str,
    job_description: str,
    ats_score: int,
    missing_keywords: List[str],
    api_key: str
) -> Dict:
    """Use OpenAI GPT for intelligent suggestions."""
    from openai import OpenAI
    
    client = OpenAI(api_key=api_key)
    
    # Truncate for token limits
    resume_excerpt = resume_text[:2000]
    jd_excerpt = job_description[:1500]
    missing_str = ", ".join(missing_keywords[:15])
    
    prompt = f"""You are an expert ATS (Applicant Tracking System) consultant and resume coach.

Analyze this resume against the job description and provide specific, actionable improvement suggestions.

RESUME (excerpt):
{resume_excerpt}

JOB DESCRIPTION (excerpt):
{jd_excerpt}

CURRENT ATS SCORE: {ats_score}/100
MISSING KEYWORDS: {missing_str}

Provide a JSON response with this exact structure:
{{
    "summary": "2-3 sentence overall assessment",
    "job_role_relevance": "Brief description of how well the candidate matches the role",
    "top_suggestions": [
        {{
            "category": "Keywords|Skills|Experience|Education|Formatting",
            "priority": "high|medium|low",
            "suggestion": "Specific actionable advice",
            "impact": "Expected ATS score improvement"
        }}
    ],
    "strengths": ["strength1", "strength2", "strength3"],
    "quick_wins": ["quick action 1", "quick action 2", "quick action 3"]
}}

Provide exactly 5 suggestions in top_suggestions, 3 strengths, and 3 quick wins.
Response must be valid JSON only, no markdown."""
    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=800
    )
    
    content = response.choices[0].message.content.strip()
    
    # Parse JSON response
    import json
    result = json.loads(content)
    result["ai_powered"] = True
    return result


def _rule_based_suggestions(
    resume_text: str,
    job_description: str,
    ats_score: int,
    missing_keywords: List[str]
) -> Dict:
    """Generate intelligent rule-based suggestions without AI API."""
    resume_lower = resume_text.lower()
    jd_lower = job_description.lower()
    
    suggestions = []
    strengths = []
    quick_wins = []
    
    # --- Keyword suggestions ---
    if len(missing_keywords) > 5:
        top_missing = missing_keywords[:8]
        suggestions.append({
            "category": "Keywords",
            "priority": "high",
            "suggestion": f"Add these high-priority missing keywords naturally into your resume: {', '.join(top_missing[:5])}",
            "impact": "+10-15 ATS points"
        })
    elif len(missing_keywords) > 0:
        suggestions.append({
            "category": "Keywords",
            "priority": "medium",
            "suggestion": f"Consider incorporating these terms: {', '.join(missing_keywords[:3])}",
            "impact": "+5-8 ATS points"
        })
    
    # --- Skills suggestions ---
    skill_gaps = _identify_skill_gaps(resume_lower, jd_lower)
    if skill_gaps:
        suggestions.append({
            "category": "Skills",
            "priority": "high",
            "suggestion": f"Your skills section is missing key technical requirements. Add a dedicated 'Technical Skills' section including: {', '.join(skill_gaps[:4])}",
            "impact": "+8-12 ATS points"
        })
    
    # --- Experience suggestions ---
    if not re.search(r'\d+\s*%|\d+\s*(users|clients|projects|revenue|performance)', resume_lower):
        suggestions.append({
            "category": "Experience",
            "priority": "high",
            "suggestion": "Add quantifiable achievements to your experience (e.g., 'Improved performance by 40%', 'Led team of 5 engineers', 'Served 10K+ users'). Numbers dramatically increase ATS and recruiter scores.",
            "impact": "+6-10 ATS points"
        })
    else:
        strengths.append("Good use of quantifiable achievements")
    
    # --- Summary section ---
    if not re.search(r'\b(summary|objective|profile|about)\b', resume_lower):
        suggestions.append({
            "category": "Formatting",
            "priority": "medium",
            "suggestion": "Add a professional summary at the top of your resume (2-3 sentences) that mirrors language from the job description. This is often the first thing ATS systems parse.",
            "impact": "+4-7 ATS points"
        })
        quick_wins.append("Add a 2-3 line professional summary tailored to this role")
    
    # --- Contact info ---
    if not re.search(r'linkedin\.com', resume_lower):
        quick_wins.append("Add your LinkedIn profile URL to contact information")
    
    if not re.search(r'github\.com|portfolio|website', resume_lower):
        quick_wins.append("Add GitHub profile or portfolio link for technical roles")
    
    # --- Action verbs ---
    weak_verbs = ['worked on', 'helped with', 'was responsible for', 'did', 'made']
    strong_verbs = ['developed', 'implemented', 'designed', 'led', 'architected', 'optimized', 'built']
    
    has_weak = any(v in resume_lower for v in weak_verbs)
    has_strong = any(v in resume_lower for v in strong_verbs)
    
    if has_weak and not has_strong:
        suggestions.append({
            "category": "Experience",
            "priority": "medium",
            "suggestion": "Replace weak verbs like 'worked on' or 'helped with' with strong action verbs: 'Developed', 'Implemented', 'Architected', 'Led', 'Optimized', 'Delivered'.",
            "impact": "+3-5 ATS points"
        })
    elif has_strong:
        strengths.append("Good use of action verbs in experience descriptions")
    
    # --- Education match ---
    if re.search(r'\b(bachelor|master|phd|b\.s\.|m\.s\.)\b', resume_lower):
        strengths.append("Educational qualifications clearly listed")
    else:
        quick_wins.append("Ensure education section clearly states degree type and graduation year")
    
    # --- Formatting ---
    word_count = len(resume_text.split())
    if 300 <= word_count <= 700:
        strengths.append(f"Optimal resume length ({word_count} words)")
    
    # --- Job role relevance ---
    jd_title_match = re.search(
        r'\b(software engineer|data scientist|product manager|devops|frontend|backend|fullstack|analyst|designer)\b',
        jd_lower
    )
    job_role = jd_title_match.group(1).title() if jd_title_match else "the advertised role"
    
    # Pad to minimums
    while len(suggestions) < 3:
        suggestions.append({
            "category": "Keywords",
            "priority": "low",
            "suggestion": "Tailor your resume for each job application by mirroring the exact language used in the job description.",
            "impact": "+3-5 ATS points"
        })
    
    while len(strengths) < 3:
        strengths.append("Resume has clear and readable structure")
    
    if len(quick_wins) < 3:
        quick_wins.extend([
            "Use consistent date formatting throughout (e.g., Jan 2022 - Present)",
            "Ensure all section headers use standard names (Experience, Education, Skills)",
            "Save/submit resume as PDF to preserve formatting"
        ])
    
    # Score-based summary
    if ats_score >= 75:
        summary = f"Your resume is a strong match for this position with an ATS score of {ats_score}/100. Focus on incorporating a few missing keywords to push closer to 90+."
    elif ats_score >= 55:
        summary = f"Your resume has good potential with an ATS score of {ats_score}/100. Adding the missing keywords and quantifying achievements will significantly improve your chances."
    else:
        summary = f"Your resume needs targeted improvements (current score: {ats_score}/100). Focus on aligning your skills section and experience descriptions with the job requirements."
    
    return {
        "summary": summary,
        "job_role_relevance": f"Moderate alignment with {job_role}. Key gaps identified in technical keywords and skills matching.",
        "top_suggestions": suggestions[:5],
        "strengths": strengths[:3],
        "quick_wins": quick_wins[:3],
        "ai_powered": False
    }


def _identify_skill_gaps(resume_lower: str, jd_lower: str) -> List[str]:
    """Find skills required in JD but missing in resume."""
    from ats_engine.scorer import SKILL_CATEGORIES
    
    gaps = []
    for category, skills in SKILL_CATEGORIES.items():
        for skill in skills:
            if skill in jd_lower and skill not in resume_lower:
                gaps.append(skill)
    
    return gaps[:8]
