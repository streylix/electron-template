import React, { useState, useEffect } from 'react';

const TransitionContainer = ({ children, loading, loadingComponent }) => {
  const [currentView, setCurrentView] = useState('content');
  const [transitioning, setTransitioning] = useState(false);
  const [content, setContent] = useState(children);
  
  useEffect(() => {
    if (loading && currentView !== 'loading') {
      // Start transition to loading view
      setTransitioning(true);
      setTimeout(() => {
        setCurrentView('loading');
        setTransitioning(false);
      }, 300); // Match CSS transition duration
    } else if (!loading && currentView !== 'content') {
      // Start transition back to content view
      setTransitioning(true);
      setTimeout(() => {
        setCurrentView('content');
        setTransitioning(false);
      }, 300); // Match CSS transition duration
    }
  }, [loading, currentView]);
  
  // Update content when children change (if not transitioning)
  useEffect(() => {
    if (currentView === 'content' && !transitioning) {
      setContent(children);
    }
  }, [children, currentView, transitioning]);
  
  return (
    <div className="transition-container">
      <div 
        className={`transition-view ${currentView === 'content' ? 'active' : 'inactive'} ${transitioning ? 'transitioning' : ''}`}
      >
        {content}
      </div>
      <div 
        className={`transition-view ${currentView === 'loading' ? 'active' : 'inactive'} ${transitioning ? 'transitioning' : ''}`}
      >
        {loadingComponent}
      </div>
    </div>
  );
};

export default TransitionContainer; 