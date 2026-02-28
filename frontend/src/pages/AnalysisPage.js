import React, { useState, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './AnalysisPage.css';

const AnalysisPage = ({ onBack, onResults }) => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);

  const LOADING_STEPS = [
    'Extracting text from resume...',
    'Analyzing keyword matches...',
    'Evaluating skills alignment...',
    'Calculating ATS score...',
    'Generating AI suggestions...'
  ];

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSetFile(dropped);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const validateAndSetFile = (f) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];
    const ext = f.name.split('.').pop().toLowerCase();
    const allowedExt = ['pdf', 'docx', 'doc', 'txt'];
    
    if (!allowedExt.includes(ext)) {
      setError('Please upload a PDF, DOCX, DOC, or TXT file.');
      return;
    }
    
    if (f.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      return;
    }
    
    setError('');
    setFile(f);
  };

  const handleFileInput = (e) => {
    if (e.target.files[0]) validateAndSetFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please upload your resume first.');
      return;
    }
    if (jobDescription.trim().length < 50) {
      setError('Please provide a more detailed job description (minimum 50 characters).');
      return;
    }

    setError('');
    setIsLoading(true);
    setLoadingStep(0);

    // Cycle loading steps for UX
    const stepInterval = setInterval(() => {
      setLoadingStep(prev => Math.min(prev + 1, LOADING_STEPS.length - 1));
    }, 1200);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('job_description', jobDescription);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/resume/analyze`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000
        }
      );

      clearInterval(stepInterval);
      
      if (response.data.success) {
        onResults(response.data.data);
      } else {
        setError(response.data.error || 'Analysis failed. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      clearInterval(stepInterval);
      if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        setError('Cannot connect to backend. Please ensure the Flask server is running on port 5000.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('An error occurred. Please ensure the backend server is running.');
      }
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const SAMPLE_JD = `Senior Full Stack Engineer - Remote

We are looking for a passionate Senior Full Stack Engineer to join our growing team.

Requirements:
- 5+ years of experience in software development
- Strong proficiency in React.js and Node.js or Python
- Experience with PostgreSQL, MongoDB, and Redis
- Proficiency with AWS (EC2, S3, Lambda, RDS)
- Experience with Docker and Kubernetes
- Familiarity with CI/CD pipelines (GitHub Actions, Jenkins)
- Strong understanding of REST APIs and GraphQL

Nice to have:
- Experience with TypeScript
- Machine learning / AI integration experience
- Agile/Scrum methodology experience

Responsibilities:
- Design and implement scalable backend services using Python FastAPI or Node.js
- Build responsive React frontends with modern state management
- Deploy and maintain applications on AWS infrastructure
- Collaborate with cross-functional teams to deliver product features
- Mentor junior developers and conduct code reviews

Education: Bachelor's degree in Computer Science or equivalent experience`;

  return (
    <div className="analysis-page">
      <Navbar onHome={() => onBack()} showBack onBack={onBack} />
      
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-card">
            <div className="loading-spinner">
              <div className="spinner-ring" />
              <div className="spinner-ring spinner-ring-2" />
              <div className="spinner-core">◈</div>
            </div>
            <h3 className="loading-title">Analyzing Your Resume</h3>
            <p className="loading-step">{LOADING_STEPS[loadingStep]}</p>
            <div className="loading-progress">
              <div 
                className="loading-bar" 
                style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }} 
              />
            </div>
            <div className="loading-steps-list">
              {LOADING_STEPS.map((step, i) => (
                <div key={i} className={`loading-step-item ${i <= loadingStep ? 'done' : ''} ${i === loadingStep ? 'active' : ''}`}>
                  <span className="step-indicator">{i < loadingStep ? '✓' : i === loadingStep ? '◉' : '○'}</span>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="analysis-container">
        <div className="analysis-header">
          <div className="section-label">New Analysis</div>
          <h1 className="analysis-title">Upload Resume & Job Description</h1>
          <p className="analysis-subtitle">
            For best results, use the actual job posting you're applying to.
          </p>
        </div>
        
        <div className="analysis-grid">
          {/* Left: Upload */}
          <div className="upload-section">
            <div className="form-label">
              <span className="label-num">01</span>
              Resume File
            </div>
            
            <div
              className={`dropzone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !file && document.getElementById('file-input').click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
              
              {!file ? (
                <div className="dropzone-content">
                  <div className="dropzone-icon">
                    {isDragging ? '⬇' : '📄'}
                  </div>
                  <div className="dropzone-text">
                    {isDragging ? 'Drop it here!' : 'Drag & drop your resume'}
                  </div>
                  <div className="dropzone-subtext">or click to browse</div>
                  <div className="dropzone-formats">PDF • DOCX • DOC • TXT</div>
                </div>
              ) : (
                <div className="file-preview">
                  <div className="file-icon">
                    {file.name.endsWith('.pdf') ? '📕' : '📘'}
                  </div>
                  <div className="file-info">
                    <div className="file-name">{file.name}</div>
                    <div className="file-meta">{formatFileSize(file.size)} · Ready to analyze</div>
                  </div>
                  <button
                    className="file-remove"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Right: Job Description */}
          <div className="jd-section">
            <div className="form-label">
              <span className="label-num">02</span>
              Job Description
              <button 
                className="sample-btn"
                onClick={() => setJobDescription(SAMPLE_JD)}
                title="Load sample job description"
              >
                Load Sample
              </button>
            </div>
            
            <textarea
              className="jd-textarea"
              placeholder="Paste the complete job description here...&#10;&#10;Include: Required skills, experience level, technologies, responsibilities, etc.&#10;&#10;More detail = more accurate analysis."
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              rows={16}
            />
            
            <div className="jd-footer">
              <span className="char-count">
                {jobDescription.length} chars
                {jobDescription.length < 50 && jobDescription.length > 0 && (
                  <span className="char-warning"> (need {50 - jobDescription.length} more)</span>
                )}
              </span>
              {jobDescription.length >= 50 && (
                <span className="jd-ready">✓ Ready</span>
              )}
            </div>
          </div>
        </div>
        
        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠</span>
            {error}
          </div>
        )}
        
        <div className="submit-row">
          <div className="submit-info">
            <div className="submit-checklist">
              <span className={file ? 'check done' : 'check'}>
                {file ? '✓' : '○'} Resume uploaded
              </span>
              <span className={jobDescription.length >= 50 ? 'check done' : 'check'}>
                {jobDescription.length >= 50 ? '✓' : '○'} Job description added
              </span>
            </div>
          </div>
          
          <button
            className={`analyze-btn ${file && jobDescription.length >= 50 ? 'ready' : 'disabled'}`}
            onClick={handleSubmit}
            disabled={!file || jobDescription.length < 50}
          >
            <span>Analyze Resume</span>
            <span className="btn-arrow">→</span>
          </button>
        </div>
        
        <div className="analysis-note">
          <span>🔒</span>
          Your resume is processed locally and never stored. Analysis typically takes 5-15 seconds.
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;
