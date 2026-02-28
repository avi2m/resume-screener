"""
Automated Resume Screening - Main Application Entry Point
"""
import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max upload
    app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')
    app.config['OPENAI_API_KEY'] = os.getenv('OPENAI_API_KEY', '')
    app.config['USE_AI'] = bool(app.config['OPENAI_API_KEY'])
    
    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Enable CORS for React frontend
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Register blueprints
    from routes.resume_routes import resume_bp
    from routes.health_routes import health_bp
    
    app.register_blueprint(resume_bp, url_prefix='/api/resume')
    app.register_blueprint(health_bp, url_prefix='/api')
    
    return app


if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'true').lower() == 'true'
    print(f"🚀 Resume Screener API running on http://localhost:{port}")
    print(f"🤖 AI Mode: {'OpenAI GPT' if app.config['USE_AI'] else 'NLP-based (no API key)'}")
    app.run(host='0.0.0.0', port=port, debug=debug)
