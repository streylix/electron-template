import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import LoadingCircle from '../common/LoadingCircle';

const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  
  const loadingTasks = [
    { task: 'Initializing application...', time: () => 500 + Math.random() * 1500 },
    { task: 'Loading user preferences...', time: () => 800 + Math.random() * 1200 },
    { task: 'Connecting to server...', time: () => 1000 + Math.random() * 2000 },
    { task: 'Fetching database records...', time: () => 1200 + Math.random() * 1800 },
    { task: 'Processing data...', time: () => 900 + Math.random() * 1500 },
    { task: 'Setting up workspace...', time: () => 700 + Math.random() * 1300 },
    { task: 'Finalizing setup...', time: () => 500 + Math.random() * 1000 },
  ];

  useEffect(() => {
    let currentIndex = 0;
    setCurrentTask(loadingTasks[0].task);
    
    const simulateLoading = () => {
      if (currentIndex < loadingTasks.length) {
        const task = loadingTasks[currentIndex];
        const taskTime = task.time();
        const taskProgress = (currentIndex + 1) / loadingTasks.length * 100;
        
        setTimeout(() => {
          setProgress(taskProgress);
          currentIndex++;
          
          if (currentIndex < loadingTasks.length) {
            setCurrentTask(loadingTasks[currentIndex].task);
            simulateLoading();
          } else {
            setCurrentTask('Loading complete!');
            setTimeout(() => {
              setIsComplete(true);
              // Allow time for the completion animation before calling onComplete
              setTimeout(onComplete, 1000);
            }, 500);
          }
        }, taskTime);
      }
    };
    
    simulateLoading();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <div className={`loading-screen ${isComplete ? 'fade-exit-active' : ''}`}>
      <div className="loading-circle">
        <LoadingCircle size={100} />
      </div>
      
      <div className="loading-details">
        <h2>{currentTask}</h2>
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p>Loading: {Math.round(progress)}%</p>
        </div>
      </div>
      
      {!isComplete && (
        <button className="back-button" onClick={onComplete}>
          <ArrowLeft size={16} />
          Back to Templates
        </button>
      )}
    </div>
  );
};

export default LoadingScreen; 