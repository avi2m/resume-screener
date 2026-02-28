from flask import Blueprint, jsonify, current_app

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "version": "1.0.0",
        "ai_mode": "OpenAI GPT" if current_app.config.get('OPENAI_API_KEY') else "NLP-based",
        "endpoints": [
            "POST /api/resume/analyze",
            "GET /api/resume/sample",
            "GET /api/health"
        ]
    })
