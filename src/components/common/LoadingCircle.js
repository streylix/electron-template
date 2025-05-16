import React from 'react';

const LoadingCircle = ({ size = 24, color = 'currentColor', className = '', style = {} }) => {
  const combinedStyle = {
    ...style,
    animation: 'spin 1.5s linear infinite',
    transformOrigin: 'center'
  };
  
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`${className}`}
      style={combinedStyle}
    >
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="#393E46" 
        strokeOpacity="0.25" 
        fill="none"
      />
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="#94897B"
        strokeDasharray="60 100"
        strokeDashoffset="0"
        fill="none"
      />
    </svg>
  );
};

export default LoadingCircle; 