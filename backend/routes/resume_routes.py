"""
Resume API Routes
"""
import os
import logging
from flask import Blueprint, request, jsonify, current_app

from text_extractors import extract_text
from ats_engine import (
    calculate_keyword_match,
    calculate_skills_match,
    calculate_experience_score,
    calculate_education_score,
    calculate_formatting_score,
    calculate_ats_score
)
from ml_engine import generate_ai_suggestions
from models import AnalysisResult
from utils.validators import validate_file_upload, validate_job_description

logger = logging.getLogger(__name__)

resume_bp = Blueprint('resume', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc', 'txt'}


@resume_bp.route('/analyze', methods=['POST'])
def analyze_resume():
    """
    Main endpoint: Upload resume + job description, get ATS analysis.
    
    Form data:
    - resume: file (PDF/DOCX)
    - job_description: string
    """
    try:
        # Validate file upload
        validation_error = validate_file_upload(request, ALLOWED_EXTENSIONS)
        if validation_error:
            return jsonify({"error": validation_error}), 400
        
        file = request.files['resume']
        job_description = request.form.get('job_description', '').strip()
        
        # Validate job description
        jd_error = validate_job_description(job_description)
        if jd_error:
            return jsonify({"error": jd_error}), 400
        
        # Extract text from resume
        file_content = file.read()
        
        try:
            resume_text = extract_text(file_content, file.filename)
        except ValueError as e:
            return jsonify({"error": str(e)}), 422
        
        if len(resume_text.strip()) < 50:
            return jsonify({
                "error": "Could not extract meaningful text from the resume. Please ensure the file is not password-protected or image-only."
            }), 422
        
        # Run ATS analysis
        keyword_analysis = calculate_keyword_match(resume_text, job_description)
        skills_analysis = calculate_skills_match(resume_text, job_description)
        experience_analysis = calculate_experience_score(resume_text, job_description)
        education_analysis = calculate_education_score(resume_text, job_description)
        formatting_analysis = calculate_formatting_score(resume_text)
        
        # Calculate final ATS score
        ats_score = calculate_ats_score(
            keyword_analysis,
            skills_analysis,
            experience_analysis,
            education_analysis,
            formatting_analysis
        )
        
        # Generate AI suggestions
        api_key = current_app.config.get('OPENAI_API_KEY')
        suggestions = generate_ai_suggestions(
            resume_text=resume_text,
            job_description=job_description,
            ats_score=ats_score['total_score'],
            missing_keywords=keyword_analysis['missing_keywords'],
            api_key=api_key if api_key else None
        )
        
        # Build response
        result = AnalysisResult(
            ats_score=ats_score,
            keyword_analysis=keyword_analysis,
            skills_analysis=skills_analysis,
            experience_analysis=experience_analysis,
            education_analysis=education_analysis,
            formatting_analysis=formatting_analysis,
            suggestions=suggestions,
            resume_word_count=len(resume_text.split()),
            analysis_mode="AI-Powered (GPT)" if suggestions.get('ai_powered') else "NLP-Based"
        )
        
        logger.info(f"Analysis complete: score={ats_score['total_score']}, file={file.filename}")
        
        return jsonify({
            "success": True,
            "data": result.to_dict()
        })
        
    except Exception as e:
        logger.error(f"Analysis error: {e}", exc_info=True)
        return jsonify({
            "error": "An unexpected error occurred during analysis. Please try again.",
            "details": str(e) if current_app.debug else None
        }), 500


@resume_bp.route('/sample', methods=['GET'])
def get_sample_analysis():
    """Return a sample analysis result for demo/testing."""
    sample = {
        "success": True,
        "data": {
            "ats_score": {
                "total_score": 72,
                "grade": "Good",
                "grade_color": "info",
                "component_scores": {
                    "keywords": 68,
                    "skills": 75,
                    "experience": 80,
                    "education": 90,
                    "formatting": 85
                },
                "weights": {
                    "keywords": 35,
                    "skills": 30,
                    "experience": 20,
                    "education": 10,
                    "formatting": 5
                }
            },
            "keyword_analysis": {
                "matched_keywords": ["python", "react", "machine learning", "sql", "aws", "docker"],
                "missing_keywords": ["kubernetes", "terraform", "fastapi", "redis", "kafka"],
                "match_rate": 0.68,
                "matched_count": 6,
                "total_jd_keywords": 11
            },
            "is_sample": True
        }
    }
    return jsonify(sample)
