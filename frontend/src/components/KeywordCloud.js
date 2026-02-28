import React from 'react';
import './KeywordCloud.css';

const KeywordCloud = ({ matched, missing, matchRate }) => {
  return (
    <div className="keyword-cloud animate-fadeIn">
      <div className="keyword-stats-row">
        <div className="kw-stat">
          <span className="kw-stat-num" style={{ color: 'var(--accent-success)' }}>
            {matched.length}
          </span>
          <span className="kw-stat-label">Matched Keywords</span>
        </div>
        <div className="kw-divider" />
        <div className="kw-stat">
          <span className="kw-stat-num" style={{ color: 'var(--accent-danger)' }}>
            {missing.length}
          </span>
          <span className="kw-stat-label">Missing Keywords</span>
        </div>
        <div className="kw-divider" />
        <div className="kw-stat">
          <span className="kw-stat-num" style={{ color: 'var(--accent-primary)' }}>
            {Math.round(matchRate * 100)}%
          </span>
          <span className="kw-stat-label">Match Rate</span>
        </div>
      </div>
      
      <div className="keyword-panels">
        <div className="keyword-panel matched-panel">
          <div className="panel-header">
            <span className="panel-dot matched" />
            <span className="panel-title">Matched Keywords</span>
            <span className="panel-count">{matched.length}</span>
          </div>
          <div className="keyword-tags">
            {matched.length > 0 ? (
              matched.map((kw, i) => (
                <span key={i} className="keyword-tag matched-tag">
                  ✓ {kw}
                </span>
              ))
            ) : (
              <span className="empty-state">No keyword matches found</span>
            )}
          </div>
        </div>
        
        <div className="keyword-panel missing-panel">
          <div className="panel-header">
            <span className="panel-dot missing" />
            <span className="panel-title">Missing Keywords</span>
            <span className="panel-count">{missing.length}</span>
          </div>
          <div className="keyword-tags">
            {missing.length > 0 ? (
              missing.map((kw, i) => (
                <span key={i} className="keyword-tag missing-tag">
                  + {kw}
                </span>
              ))
            ) : (
              <span className="empty-state">🎉 No major missing keywords!</span>
            )}
          </div>
          {missing.length > 0 && (
            <div className="missing-tip">
              💡 Add these keywords naturally into your resume to improve your ATS score.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KeywordCloud;
