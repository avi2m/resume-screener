import React, { useState } from 'react';
import './SuggestionsPanel.css';

const PRIORITY_CONFIG = {
  high: { label: 'High Impact', color: 'var(--accent-danger)', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
  medium: { label: 'Medium Impact', color: 'var(--accent-warning)', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
  low: { label: 'Low Impact', color: 'var(--accent-success)', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
};

const CATEGORY_ICONS = {
  Keywords: '🔑',
  Skills: '⚡',
  Experience: '💼',
  Education: '🎓',
  Formatting: '✨',
};

const SuggestionsPanel = ({ suggestions }) => {
  const [expanded, setExpanded] = useState(null);

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="suggestions-empty animate-fadeIn">
        <div className="empty-icon">✅</div>
        <h3>Excellent! No Major Issues Found</h3>
        <p>Your resume is well-optimized for this position.</p>
      </div>
    );
  }

  // Sort: high first
  const sorted = [...suggestions].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return (order[a.priority] || 1) - (order[b.priority] || 1);
  });

  return (
    <div className="suggestions-panel animate-fadeIn">
      <div className="suggestions-intro">
        <span className="intro-icon">🎯</span>
        <span className="intro-text">
          {sorted.filter(s => s.priority === 'high').length} high-priority improvements identified.
          Implementing these suggestions can significantly increase your ATS score.
        </span>
      </div>
      
      <div className="suggestions-list">
        {sorted.map((suggestion, i) => {
          const priority = PRIORITY_CONFIG[suggestion.priority] || PRIORITY_CONFIG.medium;
          const isExpanded = expanded === i;
          
          return (
            <div key={i} className={`suggestion-card ${isExpanded ? 'expanded' : ''}`}>
              <button
                className="suggestion-header"
                onClick={() => setExpanded(isExpanded ? null : i)}
              >
                <div className="suggestion-left">
                  <div 
                    className="priority-badge"
                    style={{ background: priority.bg, border: `1px solid ${priority.border}`, color: priority.color }}
                  >
                    {priority.label}
                  </div>
                  <span className="suggestion-category">
                    {CATEGORY_ICONS[suggestion.category] || '💡'} {suggestion.category}
                  </span>
                </div>
                <div className="suggestion-right">
                  {suggestion.impact && (
                    <span className="impact-badge">{suggestion.impact}</span>
                  )}
                  <span className="expand-icon">{isExpanded ? '−' : '+'}</span>
                </div>
              </button>
              
              {isExpanded && (
                <div className="suggestion-body">
                  <p className="suggestion-text">{suggestion.suggestion}</p>
                  {suggestion.impact && (
                    <div className="impact-note">
                      <span>📈 Expected impact:</span> {suggestion.impact}
                    </div>
                  )}
                </div>
              )}
              
              {!isExpanded && (
                <div className="suggestion-preview">
                  {suggestion.suggestion?.substring(0, 90)}{suggestion.suggestion?.length > 90 ? '...' : ''}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="suggestions-footer">
        <span>💡 Click any suggestion to expand details. Start with high-priority items first.</span>
      </div>
    </div>
  );
};

export default SuggestionsPanel;
