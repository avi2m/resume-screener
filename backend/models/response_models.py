"""
Pydantic-style models for structured API responses
"""
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional


@dataclass
class ComponentScores:
    keywords: int
    skills: int
    experience: int
    education: int
    formatting: int


@dataclass
class ATSScore:
    total_score: int
    grade: str
    grade_color: str
    component_scores: Dict
    weights: Dict


@dataclass
class AnalysisResult:
    ats_score: Dict
    keyword_analysis: Dict
    skills_analysis: Dict
    experience_analysis: Dict
    education_analysis: Dict
    formatting_analysis: Dict
    suggestions: Dict
    resume_word_count: int
    analysis_mode: str
    
    def to_dict(self):
        return {
            "ats_score": self.ats_score,
            "keyword_analysis": self.keyword_analysis,
            "skills_analysis": self.skills_analysis,
            "experience_analysis": self.experience_analysis,
            "education_analysis": self.education_analysis,
            "formatting_analysis": self.formatting_analysis,
            "suggestions": self.suggestions,
            "resume_word_count": self.resume_word_count,
            "analysis_mode": self.analysis_mode
        }
