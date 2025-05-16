import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// Types: success, error, warning, info
const SnackBar = ({ message, type = 'info', action, onAction, autoHideDuration = 4000, onClose }) => {
  const [visible, setVisible] = useState(true);
  
  // Auto hide after duration
  useEffect(() => {
    if (autoHideDuration) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) setTimeout(onClose, 300); // Wait for animation to complete
      }, autoHideDuration);
      
      return () => clearTimeout(timer);
    }
  }, [autoHideDuration, onClose]);
  
  // Handle close button click
  const handleClose = () => {
    setVisible(false);
    if (onClose) setTimeout(onClose, 300); // Wait for animation to complete
  };
  
  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} />;
      case 'error':
        return <XCircle size={18} />;
      case 'warning':
        return <AlertCircle size={18} />;
      case 'info':
      default:
        return <Info size={18} />;
    }
  };
  
  return (
    <div className={`snackbar-wrapper ${visible ? 'visible' : 'hidden'}`}>
      <div className={`snackbar snackbar-${type}`}>
        <div className="snackbar-icon">
          {getIcon()}
        </div>
        <div className="snackbar-content">
          <span className="snackbar-message">{message}</span>
          {action && (
            <button 
              className="snackbar-action" 
              onClick={() => { if (onAction) onAction(); handleClose(); }}
            >
              {action}
            </button>
          )}
        </div>
        <button className="snackbar-close" onClick={handleClose}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default SnackBar; 