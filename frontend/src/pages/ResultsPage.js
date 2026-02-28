import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ScoreGauge from '../components/ScoreGauge';
import KeywordCloud from '../components/KeywordCloud';
import SkillsBreakdown from '../components/SkillsBreakdown';
import SuggestionsPanel from '../components/SuggestionsPanel';
import './ResultsPage.css';

const ResultsPage = ({ data, onNewAnalysis, onHome }) => {
  const [animated, setAnimated] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const { ats_score, keyword_analysis, skills_analysis, experience_analysis, 
          education_analysis, formatting_analysis, suggestions, resume_word_count, analysis_mode } = data;

  const score = ats_score.total_score;
  const scoreColor = score >= 75 ? 'var(--accent-success)' 
                   : score >= 55 ? 'var(--accent-warning)' 
                   : 'var(--accent-danger)';

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'keywords', label: 'Keywords' },
    { id: 'skills', label: 'Skills' },
    { id: 'suggestions', label: `Suggestions (${suggestions?.top_suggestions?.length || 0})` }
  ];

  const components = [
    { key: 'keywords', label: 'Keyword Match', icon: '🔍', weight: '35%' },
    { key: 'skills', label: 'Skills Match', icon: '⚡', weight: '30%' },
    { key: 'experience', label: 'Experience', icon: '💼', weight: '20%' },
    { key: 'education', label: 'Education', icon: '🎓', weight: '10%' },
    { key: 'formatting', label: 'Formatting', icon: '✨', weight: '5%' },
  ];

  return (
    <div className="results-page">
      <Navbar onHome={onHome} showBack onBack={onNewAnalysis} />
      
      <div className="results-container">
        {/* Header */}
        <div className="results-header">
          <div className={`results-header-left ${animated ? 'animate-fadeUp' : ''}`}>
            <div className="section-label">Analysis Complete</div>
            <h1 className="results-title">Your ATS Report</h1>
            <div className="results-meta">
              <span className="meta-chip">
                <span className="meta-dot" style={{ background: suggestions?.ai_powered ? 'var(--accent-primary)' : 'var(--accent-secondary)' }} />
                {analysis_mode}
              </span>
              <span className="meta-chip">📝 {resume_word_count} words</span>
              <span className="meta-chip">
                {score >= 75 ? '🟢' : score >= 55 ? '🟡' : '🔴'} {ats_score.grade}
              </span>
            </div>
          </div>
          
          <div className="results-header-actions">
            <button className="btn-outline" onClick={onNewAnalysis}>
              Analyze Another →
            </button>
          </div>
        </div>

        {/* Score Hero */}
        <div className={`score-hero ${animated ? 'animate-fadeUp' : ''}`}>
          <div className="score-hero-main">
            <ScoreGauge score={score} animated={animated} />
            <div className="score-hero-info">
              <div className="score-verdict" style={{ color: scoreColor }}>
                {ats_score.grade} Match
              </div>
              <p className="score-summary">
                {suggestions?.summary || `Your resume scored ${score}/100 on ATS compatibility.`}
              </p>
              {suggestions?.job_role_relevance && (
                <div className="role-relevance">
                  <span className="role-label">Role Fit:</span>
                  {suggestions.job_role_relevance}
                </div>
              )}
            </div>
          </div>
          
          {/* Component scores */}
          <div className="score-components">
            {components.map((comp, i) => {
              const compScore = ats_score.component_scores[comp.key];
              return (
                <div key={comp.key} className="score-component" 
                     style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="comp-header">
                    <span className="comp-icon">{comp.icon}</span>
                    <span className="comp-label">{comp.label}</span>
                    <span className="comp-weight">{comp.weight}</span>
                  </div>
                  <div className="comp-bar-track">
                    <div 
                      className="comp-bar-fill"
                      style={{ 
                        width: animated ? `${compScore}%` : '0%',
                        background: compScore >= 75 ? 'var(--accent-success)'
                                  : compScore >= 55 ? 'var(--accent-warning)'
                                  : 'var(--accent-danger)'
                      }}
                    />
                  </div>
                  <div className="comp-score" style={{
                    color: compScore >= 75 ? 'var(--accent-success)'
                         : compScore >= 55 ? 'var(--accent-warning)'
                         : 'var(--accent-danger)'
                  }}>
                    {compScore}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Quick stats row */}
        <div className="quick-stats">
          <StatCard 
            icon="🎯"
            label="Keywords Matched"
            value={`${keyword_analysis.matched_count}/${keyword_analysis.total_jd_keywords}`}
            sub={`${Math.round(keyword_analysis.match_rate * 100)}% match rate`}
            color="var(--accent-primary)"
          />
          <StatCard 
            icon="⚡"
            label="Skills Matched"
            value={`${skills_analysis.total_matched_skills}/${skills_analysis.total_required_skills}`}
            sub={`${Math.round(skills_analysis.overall_skills_match * 100)}% skill coverage`}
            color="var(--accent-secondary)"
          />
          <StatCard 
            icon="💼"
            label="Experience"
            value={experience_analysis.candidate_years > 0 
              ? `${experience_analysis.candidate_years}+ yrs`
              : 'Not specified'}
            sub={experience_analysis.seniority_level ? 
              `${experience_analysis.seniority_level.charAt(0).toUpperCase() + experience_analysis.seniority_level.slice(1)} level` 
              : 'Level not detected'}
            color="var(--accent-success)"
          />
          <StatCard 
            icon="🎓"
            label="Education"
            value={education_analysis.resume_degree !== 'Not specified' 
              ? education_analysis.resume_degree 
              : 'Not found'}
            sub={education_analysis.field_match ? '✓ Relevant field' : 'Field unspecified'}
            color="var(--accent-warning)"
          />
        </div>
        
        {/* Tabs */}
        <div className="tabs-bar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-grid animate-fadeIn">
              {/* Strengths */}
              {suggestions?.strengths?.length > 0 && (
                <div className="info-card strengths-card">
                  <h3 className="card-title"><span>💪</span> Strengths</h3>
                  <ul className="strength-list">
                    {suggestions.strengths.map((s, i) => (
                      <li key={i} className="strength-item">
                        <span className="strength-check">✓</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Quick wins */}
              {suggestions?.quick_wins?.length > 0 && (
                <div className="info-card quickwins-card">
                  <h3 className="card-title"><span>⚡</span> Quick Wins</h3>
                  <ul className="quickwin-list">
                    {suggestions.quick_wins.map((q, i) => (
                      <li key={i} className="quickwin-item">
                        <span className="quickwin-num">{i + 1}</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Formatting */}
              <div className="info-card formatting-card">
                <h3 className="card-title"><span>✨</span> Formatting Analysis</h3>
                <div className="formatting-stats">
                  <div className="format-stat">
                    <span className="format-num">{formatting_analysis.word_count}</span>
                    <span className="format-label">Words</span>
                  </div>
                  <div className="format-stat">
                    <span className="format-num" style={{ color: 'var(--accent-success)' }}>
                      {formatting_analysis.positives?.length || 0}
                    </span>
                    <span className="format-label">Positives</span>
                  </div>
                  <div className="format-stat">
                    <span className="format-num" style={{ color: 'var(--accent-danger)' }}>
                      {formatting_analysis.issues?.length || 0}
                    </span>
                    <span className="format-label">Issues</span>
                  </div>
                </div>
                {formatting_analysis.positives?.length > 0 && (
                  <div className="format-section">
                    {formatting_analysis.positives.map((p, i) => (
                      <div key={i} className="format-item positive">✓ {p}</div>
                    ))}
                  </div>
                )}
                {formatting_analysis.issues?.length > 0 && (
                  <div className="format-section">
                    {formatting_analysis.issues.map((issue, i) => (
                      <div key={i} className="format-item issue">⚠ {issue}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'keywords' && (
            <KeywordCloud 
              matched={keyword_analysis.matched_keywords}
              missing={keyword_analysis.missing_keywords}
              matchRate={keyword_analysis.match_rate}
            />
          )}
          
          {activeTab === 'skills' && (
            <SkillsBreakdown skillsData={skills_analysis} animated={animated} />
          )}
          
          {activeTab === 'suggestions' && (
            <SuggestionsPanel suggestions={suggestions?.top_suggestions || []} />
          )}
        </div>
        
        {/* Bottom CTA */}
        <div className="results-footer">
          <button className="btn-primary" onClick={onNewAnalysis}>
            ← Analyze Another Resume
          </button>
          <p className="footer-tip">
            💡 Tip: Re-analyze after making improvements to see your new score
          </p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="stat-card animate-fadeUp">
    <div className="stat-card-icon">{icon}</div>
    <div className="stat-card-body">
      <div className="stat-card-value" style={{ color }}>{value}</div>
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-sub">{sub}</div>
    </div>
  </div>
);

export default ResultsPage;
