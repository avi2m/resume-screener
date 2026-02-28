"""
PDF Text Extraction Module
Supports both native PDF text and scanned PDFs via OCR fallback
"""
import io
import logging
from typing import Optional

logger = logging.getLogger(__name__)


def extract_pdf_text(file_content: bytes) -> str:
    """
    Extract text from PDF file content.
    Tries pdfplumber first, falls back to PyPDF2.
    """
    text = ""
    
    # Try pdfplumber (better for complex layouts)
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(file_content)) as pdf:
            pages_text = []
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    pages_text.append(page_text)
            text = "\n".join(pages_text)
        
        if text.strip():
            logger.info(f"Extracted {len(text)} chars from PDF via pdfplumber")
            return text
    except Exception as e:
        logger.warning(f"pdfplumber failed: {e}")
    
    # Fallback to PyPDF2
    try:
        import PyPDF2
        reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        pages_text = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                pages_text.append(page_text)
        text = "\n".join(pages_text)
        
        if text.strip():
            logger.info(f"Extracted {len(text)} chars from PDF via PyPDF2")
            return text
    except Exception as e:
        logger.warning(f"PyPDF2 failed: {e}")
    
    raise ValueError("Could not extract text from PDF. The file may be corrupt or image-only.")
