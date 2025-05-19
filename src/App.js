import React, { useState, createContext, useContext, useCallback } from 'react';
import './App.css';
import { CheckCircle, XCircle, LogIn, LayoutList, Globe } from 'lucide-react';
import LoadingCircle from './components/common/LoadingCircle';

// Template components will be imported
import LoadingScreen from './components/templates/LoadingScreen';
import LoginPage from './components/templates/LoginPage';
import SidebarContentPage from './components/templates/SidebarContentPage';
import PageFinder from './components/templates/PageFinder';
import SnackBar from './components/common/SnackBar';

// Create SnackBar context
export const SnackBarContext = createContext(null);

export const useSnackBar = () => {
  const context = useContext(SnackBarContext);
  if (!context) {
    throw new Error('useSnackBar must be used within a SnackBarProvider');
  }
  return context;
};

function App() {
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [snackbar, setSnackbar] = useState(null);

  // Function to go back to the template selector
  const handleBack = () => {
    setActiveTemplate(null);
  };

  // SnackBar functions
  const showSnackBar = useCallback((message, type = 'info', action = null, onAction = null, autoHideDuration = 4000) => {
    setSnackbar({ message, type, action, onAction, autoHideDuration });
  }, []);

  const hideSnackBar = useCallback(() => {
    setSnackbar(null);
  }, []);

  const templates = [
    { id: 'loading', title: 'Loading Screen', icon: <LoadingCircle size={24} />, component: <LoadingScreen onComplete={handleBack} /> },
    { id: 'login', title: 'Login Page', icon: <LogIn size={24} />, component: <LoginPage onComplete={handleBack} /> },
    { id: 'sidebar-content', title: 'Sidebar | Content', icon: <LayoutList size={24} />, component: <SidebarContentPage onComplete={handleBack} /> },
    { id: 'page-finder', title: 'Page Finder', icon: <Globe size={24} />, component: <PageFinder onComplete={handleBack} /> },
  ];

  const handleTemplateClick = (templateId) => {
    setActiveTemplate(templateId);
  };

  // Main render component
  const renderMainContent = () => {
    // If a template is active, show it
    if (activeTemplate) {
      const template = templates.find(t => t.id === activeTemplate);
      return template.component;
    }

    // Otherwise show the template selector
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="neon-text">React + Electron Templates</h1>
          <p>Select a template to view</p>
          
          <div className="template-grid">
            {templates.map((template) => (
              <div 
                key={template.id} 
                className="template-item" 
                onClick={() => handleTemplateClick(template.id)}
              >
                <div className="template-icon">{template.icon}</div>
                <div className="template-title">{template.title}</div>
              </div>
            ))}
          </div>
        </header>
      </div>
    );
  };

  return (
    <SnackBarContext.Provider value={{ showSnackBar, hideSnackBar }}>
      {renderMainContent()}
      {snackbar && (
        <SnackBar 
          message={snackbar.message}
          type={snackbar.type}
          action={snackbar.action}
          onAction={snackbar.onAction}
          autoHideDuration={snackbar.autoHideDuration}
          onClose={hideSnackBar}
        />
      )}
    </SnackBarContext.Provider>
  );
}

export default App;
