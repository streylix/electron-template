import React from 'react';

const LoadingCircle = ({ size = 24, className = '', style = {} }) => {
  const combinedStyle = {
    ...style,
    transformOrigin: 'center'
  };
  
  // Definition for the gradient that matches the progress bar
  const gradientId = "spinnerGradient";
  
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={`${className}`}
      style={combinedStyle}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--accent-green)" />
          <stop offset="100%" stopColor="var(--accent-blue)" />
        </linearGradient>
      </defs>
      
      {/* Background gray circle */}
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        fill="#2A2A2A"
      />
      
      {/* Static outer ring */}
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="#393E46" 
        strokeOpacity="0.35" 
        strokeWidth="2"
        fill="none"
      />
      
      {/* Animated gradient spinner */}
      <g style={{
        animation: 'spin 1.5s linear infinite',
        transformOrigin: 'center'
      }}>
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={`url(#${gradientId})`}
          strokeWidth="2.5"
          strokeDasharray="32 68"
          fill="none"
        />
      </g>
    </svg>
  );
};

export default LoadingCircle; 