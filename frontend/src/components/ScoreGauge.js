import React, { useEffect, useState } from 'react';
import './ScoreGauge.css';

const ScoreGauge = ({ score, animated }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!animated) return;
    
    let start = 0;
    const increment = score / 60;
    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [animated, score]);

  // SVG arc gauge
  const radius = 70;
  const cx = 90;
  const cy = 90;
  const startAngle = -210;
  const endAngle = 30;
  const totalAngle = endAngle - startAngle;
  const fillAngle = (displayScore / 100) * totalAngle;

  const toRad = (deg) => (deg * Math.PI) / 180;

  const describeArc = (cx, cy, r, startDeg, endDeg) => {
    const start = {
      x: cx + r * Math.cos(toRad(startDeg)),
      y: cy + r * Math.sin(toRad(startDeg))
    };
    const end = {
      x: cx + r * Math.cos(toRad(endDeg)),
      y: cy + r * Math.sin(toRad(endDeg))
    };
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  };

  const trackPath = describeArc(cx, cy, radius, startAngle, endAngle);
  const fillPath = displayScore > 0
    ? describeArc(cx, cy, radius, startAngle, startAngle + fillAngle)
    : '';

  const gaugeColor = score >= 75 ? '#10b981' 
                   : score >= 55 ? '#f59e0b' 
                   : '#ef4444';

  const gradientId = `gauge-grad-${score}`;

  return (
    <div className="score-gauge">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={gaugeColor} stopOpacity="0.6" />
            <stop offset="100%" stopColor={gaugeColor} />
          </linearGradient>
        </defs>
        
        {/* Track */}
        <path
          d={trackPath}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        
        {/* Fill */}
        {fillPath && (
          <path
            d={fillPath}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="10"
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.1s' }}
          />
        )}
        
        {/* Center text */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fontSize="38"
          fontWeight="800"
          fontFamily="Syne, sans-serif"
          fill={gaugeColor}
        >
          {displayScore}
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          fontSize="12"
          fill="rgba(255,255,255,0.4)"
          fontFamily="Space Mono, monospace"
        >
          / 100
        </text>
        <text
          x={cx}
          y={cy + 34}
          textAnchor="middle"
          fontSize="10"
          fill="rgba(255,255,255,0.25)"
          fontFamily="Space Mono, monospace"
          letterSpacing="1"
        >
          ATS SCORE
        </text>
      </svg>
    </div>
  );
};

export default ScoreGauge;
