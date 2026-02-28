import React from 'react';
import Navbar from '../components/Navbar';
import './HomePage.css';

const features = [
  {
    icon: '⚡',
    title: 'Instant ATS Score',
    desc: 'Get a 0-100 ATS compatibility score in seconds with detailed breakdown.'
  },
  {
    icon: '🔍',
    title: 'Keyword Analysis',
    desc: 'See exactly which keywords match and which are missing from the job description.'
  },
  {
    icon: '🧠',
    title: 'AI Suggestions',
    desc: 'Receive intelligent, actionable improvement suggestions powered by NLP or GPT.'
  },
  {
    icon: '📊',
    title: 'Skills Gap Report',
    desc: 'Visual breakdown of technical skills matched against job requirements.'
  },
  {
    icon: '📄',
    title: 'PDF & DOCX Support',
    desc: 'Upload any resume format — PDF, DOCX, or plain text files.'
  },
  {
    icon: '🎯',
    title: 'Role Relevance',
    desc: 'Understand how well your experience aligns with the target position.'
  }
];

const steps = [
  { num: '01', title: 'Upload Resume', desc: 'Drag & drop your PDF or DOCX resume file' },
  { num: '02', title: 'Paste Job Description', desc: 'Add the job posting you want to apply for' },
  { num: '03', title: 'Get Insights', desc: 'Receive your ATS score and improvement roadmap' }
];

const HomePage = ({ onGetStarted }) => {
  return (
    <div className="home-page">
      <Navbar onHome={() => {}} />
      
      {/* Hero */}
      <section className="hero">
        <div className="hero-glow hero-glow-left" />
        <div className="hero-glow hero-glow-right" />
        
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot" />
            AI-Powered Resume Analysis
          </div>
          
          <h1 className="hero-title">
            Beat the <span className="title-gradient">ATS Filter</span>
            <br />Before it Beats You
          </h1>
          
          <p className="hero-subtitle">
            Upload your resume and a job description. Our AI analyzes keyword match, 
            skill alignment, and formatting to give you an exact ATS compatibility score 
            with actionable improvements.
          </p>
          
          <div className="hero-actions">
            <button className="btn-primary" onClick={onGetStarted}>
              <span>Analyze My Resume</span>
              <span className="btn-arrow">→</span>
            </button>
            <div className="hero-stat">
              <span className="stat-num">100%</span>
              <span className="stat-label">Free to use</span>
            </div>
          </div>
          
          <div className="hero-tags">
            {['PDF & DOCX', 'No Login Required', 'OpenAI Optional', 'Instant Results'].map(t => (
              <span key={t} className="hero-tag">✓ {t}</span>
            ))}
          </div>
        </div>
        
        {/* Score preview card */}
        <div className="hero-preview">
          <div className="preview-card">
            <div className="preview-header">
              <span className="preview-title">ATS Analysis</span>
              <span className="preview-status">● Live</span>
            </div>
            <div className="preview-score">
              <div className="score-ring">
                <span className="score-num">78</span>
                <span className="score-label">/ 100</span>
              </div>
              <div className="score-grade">Good Match</div>
            </div>
            <div className="preview-bars">
              {[
                { label: 'Keywords', val: 72, color: 'var(--accent-primary)' },
                { label: 'Skills', val: 85, color: 'var(--accent-secondary)' },
                { label: 'Experience', val: 80, color: 'var(--accent-success)' },
                { label: 'Education', val: 90, color: 'var(--accent-warning)' },
              ].map(item => (
                <div key={item.label} className="preview-bar-row">
                  <span className="bar-label">{item.label}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${item.val}%`, background: item.color }} />
                  </div>
                  <span className="bar-val">{item.val}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* How it works */}
      <section className="section how-it-works">
        <div className="section-inner">
          <div className="section-label">Process</div>
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            {steps.map((step, i) => (
              <div key={i} className="step-card">
                <div className="step-num">{step.num}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
                {i < steps.length - 1 && <div className="step-connector">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="section features">
        <div className="section-inner">
          <div className="section-label">Capabilities</div>
          <h2 className="section-title">Everything You Need</h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="section cta-section">
        <div className="cta-card">
          <h2 className="cta-title">Ready to Optimize Your Resume?</h2>
          <p className="cta-subtitle">Takes less than 30 seconds. No account needed.</p>
          <button className="btn-primary btn-large" onClick={onGetStarted}>
            Start Free Analysis →
          </button>
        </div>
      </section>
      
      <footer className="footer">
        <span>Built with ◈ ResumeAI — AI-Powered ATS Screener</span>
      </footer>
    </div>
  );
};

export default HomePage;
