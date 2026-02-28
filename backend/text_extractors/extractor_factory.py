"""
Factory to route extraction based on file type
"""
from .pdf_extractor import extract_pdf_text
from .docx_extractor import extract_docx_text


def extract_text(file_content: bytes, filename: str) -> str:
    """
    Extract text from resume file based on its extension.
    """
    filename_lower = filename.lower()
    
    if filename_lower.endswith('.pdf'):
        return extract_pdf_text(file_content)
    elif filename_lower.endswith('.docx'):
        return extract_docx_text(file_content)
    elif filename_lower.endswith('.doc'):
        # .doc is older format, try docx extractor (may fail on very old files)
        return extract_docx_text(file_content)
    elif filename_lower.endswith('.txt'):
        return file_content.decode('utf-8', errors='replace')
    else:
        raise ValueError(f"Unsupported file type. Please upload PDF or DOCX files.")
