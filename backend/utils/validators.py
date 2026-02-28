"""
Input validation utilities
"""
from typing import Optional, Set


def validate_file_upload(request, allowed_extensions: Set[str]) -> Optional[str]:
    """Validate file upload request. Returns error message or None."""
    if 'resume' not in request.files:
        return "No resume file provided. Please upload a PDF or DOCX file."
    
    file = request.files['resume']
    
    if not file or file.filename == '':
        return "No file selected."
    
    ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
    
    if ext not in allowed_extensions:
        return f"Invalid file type '{ext}'. Allowed types: {', '.join(sorted(allowed_extensions)).upper()}"
    
    return None


def validate_job_description(job_description: str) -> Optional[str]:
    """Validate job description input."""
    if not job_description:
        return "Job description is required for analysis."
    
    if len(job_description.strip()) < 50:
        return "Job description is too short. Please provide at least 50 characters for accurate analysis."
    
    if len(job_description) > 10000:
        return "Job description is too long. Please limit to 10,000 characters."
    
    return None
