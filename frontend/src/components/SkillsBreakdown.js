import React from 'react';
import './SkillsBreakdown.css';

const CATEGORY_LABELS = {
  programming_languages: { label: 'Programming Languages', icon: '💻' },
  web_frameworks: { label: 'Web Frameworks', icon: '🌐' },
  databases: { label: 'Databases', icon: '🗄️' },
  cloud_devops: { label: 'Cloud & DevOps', icon: '☁️' },
  data_ml: { label: 'Data & ML', icon: '🧠' },
  soft_skills: { label: 'Soft Skills', icon: '🤝' },
  certifications: { label: 'Certifications', icon: '🏆' },
};

const SkillsBreakdown = ({ skillsData, animated }) => {
  const { categories, overall_skills_match, total_required_skills, total_matched_skills } = skillsData;
  
  if (!categories || Object.keys(categories).length === 0) {
    return (
      <div className="skills-empty animate-fadeIn">
        <div className="empty-icon">🔍</div>
        <h3>No Specific Skills Detected</h3>
        <p>The job description may not list specific technical skills, or skills are described in general terms. Check the Keywords tab for detailed matching.</p>
      </div>
    );
  }
  
  return (
    <div className="skills-breakdown animate-fadeIn">
      <div className="skills-summary">
        <div className="summary-score">
          <span className="summary-num">{Math.round(overall_skills_match * 100)}%</span>
          <span className="summary-label">Overall Skills Coverage</span>
        </div>
        <div className="summary-detail">
          {total_matched_skills} of {total_required_skills} required skills matched
        </div>
      </div>
      
      <div className="categories-grid">
        {Object.entries(categories).map(([catKey, catData]) => {
          const meta = CATEGORY_LABELS[catKey] || { label: catKey, icon: '⚡' };
          const pct = Math.round(catData.score * 100);
          
          return (
            <div key={catKey} className="category-card">
              <div className="cat-header">
                <span className="cat-icon">{meta.icon}</span>
                <span className="cat-label">{meta.label}</span>
                <span className={`cat-pct ${pct >= 70 ? 'good' : pct >= 40 ? 'mid' : 'low'}`}>
                  {pct}%
                </span>
              </div>
              
              <div className="cat-progress">
                <div 
                  className="cat-fill"
                  style={{ 
                    width: animated ? `${pct}%` : '0%',
                    background: pct >= 70 ? 'var(--accent-success)' 
                              : pct >= 40 ? 'var(--accent-warning)' 
                              : 'var(--accent-danger)'
                  }}
                />
              </div>
              
              <div className="cat-skills">
                {catData.matched.length > 0 && (
                  <div className="skill-group">
                    {catData.matched.map((skill, i) => (
                      <span key={i} className="skill-pill matched">{skill}</span>
                    ))}
                  </div>
                )}
                {catData.missing.length > 0 && (
                  <div className="skill-group">
                    {catData.missing.map((skill, i) => (
                      <span key={i} className="skill-pill missing">{skill}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillsBreakdown;
