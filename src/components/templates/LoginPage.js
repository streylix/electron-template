import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import LoadingCircle from '../common/LoadingCircle';
import GlowingEffect from '../common/GlowingEffect';

const LoginPage = ({ onComplete }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState(null); // null, 'loading', 'success', 'error'
  const [showPassword, setShowPassword] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      return;
    }
    
    // Start loading animation
    setLoginStatus('loading');
    
    // Simulate API call
    setTimeout(() => {
      // Random success/error for demo purposes
      // In a real app, this would be an actual authentication check
      const isSuccess = Math.random() > 0.5;
      
      setLoginStatus(isSuccess ? 'success' : 'error');
      
      // Reset after showing success/error for a moment
      if (isSuccess) {
        setTimeout(() => {
          setLoginStatus(null);
          setUsername('');
          setPassword('');
        }, 2000);
      }
    }, 1500);
  };
  
  // Button background color based on login status
  let buttonColor = 'var(--gradient-button)';
  if (loginStatus === 'loading') {
    buttonColor = 'var(--dark-gray)';
  } else if (loginStatus === 'success') {
    buttonColor = 'var(--success-gradient)';
  } else if (loginStatus === 'error') {
    buttonColor = 'var(--error-gradient)';
  }
  
  // Button icon based on login status
  const renderButtonIcon = () => {
    switch (loginStatus) {
      case 'loading':
        return <LoadingCircle size={20} />;
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <XCircle size={20} />;
      default:
        return null;
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="login-page">
      <div className="login-backdrop">
        <GlowingEffect 
          blur={8}
          spread={40}
          borderWidth={3}
          disabled={false}
          movementDuration={3}
          className="login-glow"
          glow={true}
        />
        <div className="login-container">
          <h2>Login to Your Account</h2>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loginStatus === 'loading'}
                placeholder="Enter your username"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loginStatus === 'loading'}
                  placeholder="Enter your password"
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <button
              className="login-button"
              type="submit"
              disabled={loginStatus === 'loading'}
              style={{ background: buttonColor }}
            >
              <div className="button-content">
                {renderButtonIcon()}
                <span style={{ marginLeft: renderButtonIcon() ? '10px' : '0' }}>
                  {loginStatus === 'loading' ? 'Logging in...' : 
                   loginStatus === 'success' ? 'Success' : 
                   loginStatus === 'error' ? 'Failed' : 'Login'}
                </span>
              </div>
            </button>
          </form>
        </div>
      </div>
      
      <button className="back-button" onClick={onComplete}>
        <ArrowLeft size={16} />
        Back to Templates
      </button>
    </div>
  );
};

export default LoginPage; 