import React from 'react';
import './Navbar.css';

const Navbar = ({ onHome, showBack, onBack }) => {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <button className="navbar-logo" onClick={onHome}>
          <span className="logo-icon">◈</span>
          <span className="logo-text">Resume<span className="logo-accent">AI</span></span>
        </button>
        <div className="navbar-right">
          <span className="navbar-badge">ATS Screener</span>
          {showBack && (
            <button className="navbar-back" onClick={onBack}>
              ← Back
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
