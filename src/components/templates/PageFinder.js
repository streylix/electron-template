import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import { FaPlay, FaPause, FaStop, FaCheck, FaTimes, FaCircleNotch, FaRegCircle, FaSave, FaHandPointer, FaUserCircle, FaSearchengin, FaSync, FaMagic, FaSpinner, FaExclamationCircle, FaCheckCircle, FaPaperPlane } from 'react-icons/fa';
import { ArrowLeft, ChevronLeft, ChevronRight, RefreshCw, Play, Pause, Square, CheckCircle, XCircle, Check, Download } from 'lucide-react';
import LoadingCircle from '../common/LoadingCircle';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import ReactDOMClient from 'react-dom/client';

// Lazy load the UserProfile component
const UserProfile = lazy(() => import('./UserProfile'));

const PageFinder = ({ onComplete }) => {
  const [browserUrl, setBrowserUrl] = useState('https://www.google.com');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const webviewRef = useRef(null);
  
  // Scanning state
  const [scanState, setScanState] = useState('idle'); // idle, scanning, paused, stopped, complete
  const [formElements, setFormElements] = useState([]);
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const scanIntervalRef = useRef(null);
  
  // UI State
  const [expandedSteps, setExpandedSteps] = useState({
    connection: false,
    scanning: false
  });
  
  // Add state for manual selection mode
  const [isManualSelectionMode, setIsManualSelectionMode] = useState(false);
  const [manuallySelectedForms, setManuallySelectedForms] = useState([]);
  const [savedSelections, setSavedSelections] = useState({});
  
  // Add a new state for autofill status
  const [autofillStatus, setAutofillStatus] = useState({
    active: false,
    formIndex: null,
    fieldsFound: 0,
    fieldsFilled: 0,
    completed: false,
    error: null
  });
  
  // Set up the webview preload script for form selection
  const setupWebviewPreload = () => {
    if (!webviewRef.current) return;
    
    // Create a preload script to handle communication
    const preloadScript = `
      // Create a communication bridge to send selection data back to the app
      window.electronBridge = {
        sendFormSelection: (formInfo) => {
          if (window.chrome && window.chrome.webviewInternal) {
            window.chrome.webviewInternal.postMessage('form-selection', formInfo);
          }
        }
      };
    `;
    
    // Set the preload script
    webviewRef.current.executeJavaScript(`
      (function() {
        const script = document.createElement('script');
        script.textContent = \`${preloadScript}\`;
        document.head.appendChild(script);
      })();
    `);
  };
  
  // Initialize webview event listeners with preload script
  useEffect(() => {
    const setupWebview = () => {
      const webview = document.querySelector('webview');
      if (webview) {
        webviewRef.current = webview;
        
        // Setup preload script for communication
        setupWebviewPreload();
        
        // Update URL when navigation finishes
        webview.addEventListener('did-navigate', (e) => {
          setBrowserUrl(e.url);
          setCanGoBack(webview.canGoBack());
          setCanGoForward(webview.canGoForward());
          
          // Reset scanning state on navigation
          handleStop();
          
          // Re-setup the preload script after navigation
          setupWebviewPreload();
        });
        
        // Update URL when navigation within the page occurs
        webview.addEventListener('did-navigate-in-page', (e) => {
          setBrowserUrl(e.url);
          setCanGoBack(webview.canGoBack());
          setCanGoForward(webview.canGoForward());
        });
        
        // Check if can go back/forward
        webview.addEventListener('dom-ready', () => {
          setCanGoBack(webview.canGoBack());
          setCanGoForward(webview.canGoForward());
          
          // Setup preload script again on dom-ready
          setupWebviewPreload();
        });
        
        // Add error handler
        webview.addEventListener('did-fail-load', (e) => {
          console.error('Webview failed to load:', e);
        });
      }
    };
    
    // Wait a bit for the webview to be rendered
    const timer = setTimeout(setupWebview, 500);
    return () => clearTimeout(timer);
  }, []);
  
  // Cleanup scan interval on unmount
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, []);

  // Browser navigation functions
  const browserGoBack = () => {
    if (webviewRef.current && webviewRef.current.canGoBack()) {
      webviewRef.current.goBack();
    }
  };
  
  const browserGoForward = () => {
    if (webviewRef.current && webviewRef.current.canGoForward()) {
      webviewRef.current.goForward();
    }
  };
  
  const browserRefresh = () => {
    if (webviewRef.current) {
      webviewRef.current.reload();
    }
  };
  
  // Toggle step expansion
  const toggleStepExpansion = (step) => {
    setExpandedSteps(prev => ({
      ...prev,
      [step]: !prev[step]
    }));
  };
  
  // Find all form elements on the page
  const findFormElements = async () => {
    if (!webviewRef.current) return [];
    
    try {
      const forms = await webviewRef.current.executeJavaScript(`
        (function() {
          try {
            // Use more aggressive and specific form detection based on the CACI site
            const formFinderFunctions = [
              // 1. Traditional forms
              () => Array.from(document.querySelectorAll('form')),
              
              // 2. RJSF forms - React JSON Schema Forms (exactly like in the CACI site)
              () => Array.from(document.querySelectorAll('.rjsf, form.rjsf')),
              
              // 3. Field groups and fieldsets (CACI site has many of these)
              () => Array.from(document.querySelectorAll('fieldset[id]:has(legend), div:has(> fieldset[id])')),
              
              // 4. Groups of input fields
              () => {
                // Find div containers with multiple form elements inside
                const potentialForms = Array.from(document.querySelectorAll('div'));
                return potentialForms.filter(div => {
                  const formElements = div.querySelectorAll('input:not([type="hidden"]), select, textarea');
                  return formElements.length >= 3; // At least 3 input elements
                });
              },
              
              // 5. Workday-specific forms with specific ID/class patterns
              () => Array.from(document.querySelectorAll('[id*="cntryFields"], .form-group.field-object')),
              
              // 6. Address form patterns - common in job applications
              () => Array.from(document.querySelectorAll('div:has(input[autocomplete*="address"])'))
            ];
            
            // Get forms from all detection methods
            let allFormsWithDuplicates = [];
            formFinderFunctions.forEach(finder => {
              try {
                const foundForms = finder();
                allFormsWithDuplicates = [...allFormsWithDuplicates, ...foundForms];
              } catch (e) {
                console.error('Error in form finder:', e);
              }
            });
            
            // Remove duplicates by reference
            const uniqueForms = [...new Set(allFormsWithDuplicates)];
            
            // Filter out insignificant forms
            const significantForms = uniqueForms.filter(form => {
              try {
                // Skip tiny containers
                const rect = form.getBoundingClientRect();
                if (rect.width < 50 || rect.height < 50) return false;
                
                // Skip invisible elements
                const styles = window.getComputedStyle(form);
                if (styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0') return false;
                
                // Must have at least one visible input
                const hasVisibleInputs = Array.from(form.querySelectorAll('input:not([type="hidden"]), select, textarea, button[type="submit"]'))
                  .some(input => {
                    const inputStyles = window.getComputedStyle(input);
                    return inputStyles.display !== 'none' && inputStyles.visibility !== 'hidden';
                  });
                
                return hasVisibleInputs;
              } catch (e) {
                console.error('Error filtering form:', e);
                return false;
              }
            });
            
            // Return form metadata
            return significantForms.map((form, index) => {
              const rect = form.getBoundingClientRect();
              const formId = form.id || form.getAttribute('data-ph-id') || form.getAttribute('data-form-id') || 'form-' + index;
              let formType = 'container';
              
              if (form.tagName.toLowerCase() === 'form') {
                formType = 'traditional';
              } else if (form.classList.contains('rjsf')) {
                formType = 'react-schema';
              } else if (form.tagName.toLowerCase() === 'fieldset') {
                formType = 'fieldset';
              }
              
              // Count visible input elements only
              const inputElements = form.querySelectorAll('input:not([type="hidden"]), select, textarea, button[type="submit"]');
              const visibleInputCount = Array.from(inputElements).filter(input => {
                const styles = window.getComputedStyle(input);
                return styles.display !== 'none' && styles.visibility !== 'hidden';
              }).length;
              
              return {
                index: index,
                id: formId,
                type: formType,
                element: form.tagName.toLowerCase(),
                classes: form.className,
                inputCount: visibleInputCount,
                x: rect.left + window.scrollX,
                y: rect.top + window.scrollY,
                width: rect.width,
                height: rect.height
              };
            });
          } catch (err) {
            console.error('Error finding forms:', err);
            return [];
          }
        })();
      `);
      
      return forms || [];
    } catch (error) {
      console.error('Error executing JavaScript in webview:', error);
      return [];
    }
  };
  
  // Scroll to a specific form
  const scrollToForm = async (formIndex) => {
    if (!webviewRef.current || !formElements[formIndex]) return;
    
    const form = formElements[formIndex];
    try {
      await webviewRef.current.executeJavaScript(`
        (function() {
          try {
            // Scroll to the form
            window.scrollTo({
              top: ${form.y},
              left: ${form.x},
              behavior: 'smooth'
            });
            
            // No highlighting, just log the form info
            console.log('Scrolled to form:', {
              index: ${formIndex},
              id: '${form.id || ''}',
              type: '${form.type || ''}',
              position: { x: ${form.x}, y: ${form.y} },
              size: { width: ${form.width}, height: ${form.height} }
            });
            
          } catch (err) {
            console.error('Error scrolling to form:', err);
          }
        })();
      `);
    } catch (error) {
      console.error('Error executing JavaScript in webview:', error);
    }
  };
  
  // Handle start scanning
  const handleStart = async () => {
    if (!webviewRef.current) return;
    
    // Set scanning state
    setScanState('scanning');
    
    // Find all forms on the page
    const forms = await findFormElements();
    setFormElements(forms);
    
    // If no forms found, show complete status
    if (forms.length === 0) {
      setScanState('complete');
      setScanProgress(100);
      return;
    }
    
    // Reset to first form
    setCurrentFormIndex(0);
    setScanProgress(0);
    
    // Auto-expand the scanning details
    setExpandedSteps(prev => ({
      ...prev,
      scanning: true
    }));
    
    // Scroll to first form
    await scrollToForm(0);
    
    // Calculate initial progress
    const initialProgress = Math.round((1 / forms.length) * 100);
    setScanProgress(initialProgress);
    
    // Set up interval to scroll through each form
    scanIntervalRef.current = setInterval(async () => {
      setCurrentFormIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        
        // If we've reached the end, clear interval and set complete
        if (nextIndex >= forms.length) {
          clearInterval(scanIntervalRef.current);
          setScanState('complete');
          setScanProgress(100);
          return prevIndex;
        }
        
        // Calculate progress
        const progress = Math.round(((nextIndex + 1) / forms.length) * 100);
        setScanProgress(progress);
        
        // Scroll to next form
        scrollToForm(nextIndex);
        
        return nextIndex;
      });
    }, 2000);
  };
  
  // Handle pause scanning
  const handlePause = () => {
    if (scanState === 'scanning') {
      setScanState('paused');
      clearInterval(scanIntervalRef.current);
    } else if (scanState === 'paused') {
      setScanState('scanning');
      
      // Resume interval
      scanIntervalRef.current = setInterval(async () => {
        setCurrentFormIndex(prevIndex => {
          const nextIndex = prevIndex + 1;
          
          // If we've reached the end, clear interval and set complete
          if (nextIndex >= formElements.length) {
            clearInterval(scanIntervalRef.current);
            setScanState('complete');
            setScanProgress(100);
            return prevIndex;
          }
          
          // Calculate progress
          const progress = Math.round(((nextIndex + 1) / formElements.length) * 100);
          setScanProgress(progress);
          
          // Scroll to next form
          scrollToForm(nextIndex);
          
          return nextIndex;
        });
      }, 2000);
    }
  };
  
  // Handle stop scanning
  const handleStop = () => {
    setScanState('stopped');
    clearInterval(scanIntervalRef.current);
  };
  
  // Get status info for the composite progress bar
  const getStatusInfo = () => {
    switch (scanState) {
      case 'idle':
        return {
          icon: <CheckCircle size={18} className="status-idle" />,
          message: 'Ready to scan',
          showProgress: false
        };
      case 'scanning':
        return {
          icon: <LoadingCircle size={18} className="status-scanning" />,
          message: 'Scanning forms...',
          showProgress: true
        };
      case 'paused':
        return {
          icon: <Pause size={18} className="status-paused" />,
          message: 'Scan paused',
          showProgress: true
        };
      case 'stopped':
        return {
          icon: <XCircle size={18} className="status-stopped" />,
          message: 'Scan stopped',
          showProgress: false
        };
      case 'complete':
        return {
          icon: <Check size={18} className="status-complete" />,
          message: `Found ${formElements.length} form${formElements.length !== 1 ? 's' : ''}`,
          showProgress: false
        };
      default:
        return {
          icon: <CheckCircle size={18} className="status-idle" />,
          message: 'Ready',
          showProgress: false
        };
    }
  };
  
  // Render the scanning panel based on the current state
  const renderScanningPanel = () => {
    // If we haven't started yet, show the initial panel
    if (scanState === 'idle') {
      return (
        <div className="empty-tracker-panel">
          <p>Click Start to analyze the page</p>
        </div>
      );
    }
    
    // Render tracking steps
    return (
      <>
        <div className="progress-step">
          <div className={`step-status complete`}>
            <Check size={16} />
          </div>
          <div className="step-label">Connected</div>
          <div className="step-percentage complete">100%</div>
          <button 
            className="view-details-btn"
            onClick={() => toggleStepExpansion('connection')}
          >
            {expandedSteps.connection ? 'Hide' : 'Details'}
          </button>
        </div>
        {expandedSteps.connection && (
          <div className="step-details">
            <div className="step-detail-item">
              <span className="detail-label">Status:</span>
              <span className="detail-value success">Connected</span>
            </div>
            <div className="step-detail-item">
              <span className="detail-label">URL:</span>
              <span className="detail-value">{browserUrl}</span>
            </div>
            <div className="step-progress-bar">
              <div className="step-progress-fill" style={{ width: '100%' }}></div>
            </div>
            <div className="step-notes">
              <p>Successfully connected to the page.</p>
            </div>
          </div>
        )}
        
        <div className="progress-step">
          <div className={`step-status ${
            scanState === 'scanning' ? 'in-progress' : 
            scanState === 'paused' ? 'paused' : 
            scanState === 'stopped' ? 'failed' : 
            scanState === 'complete' ? 'complete' :
            'pending'
          }`}>
            {scanState === 'scanning' ? <LoadingCircle size={16} /> : 
             scanState === 'paused' ? <Pause size={16} /> : 
             scanState === 'stopped' ? <XCircle size={16} /> :
             scanState === 'complete' ? <Check size={16} /> :
             '⭘'}
          </div>
          <div className={`step-label ${scanState === 'scanning' ? 'loading' : ''}`}>
            {scanState === 'scanning' ? 'Scanning...' : 'Scanning'}
          </div>
          <div className={`step-percentage ${scanState}`}>
            {scanState === 'paused' ? 'paused' : 
             scanState === 'stopped' ? 'stopped' : 
             `${scanProgress}%`}
          </div>
          <button 
            className="view-details-btn"
            onClick={() => toggleStepExpansion('scanning')}
          >
            {expandedSteps.scanning ? 'Hide' : 'Details'}
          </button>
        </div>
        {expandedSteps.scanning && (
          <div className="step-details">
            <div className="step-detail-item">
              <span className="detail-label">Status:</span>
              <span className={`detail-value ${
                scanState === 'scanning' ? 'in-progress' : 
                scanState === 'paused' ? 'paused' : 
                scanState === 'stopped' ? 'failed' : 
                scanState === 'complete' ? 'success' :
                'pending'
              }`}>
                {scanState === 'scanning' ? 'In Progress' : 
                 scanState === 'paused' ? 'Paused' : 
                 scanState === 'stopped' ? 'Stopped' : 
                 scanState === 'complete' ? 'Complete' :
                 'Pending'}
              </span>
            </div>
            <div className="step-detail-item">
              <span className="detail-label">Forms:</span>
              <span className="detail-value">{formElements.length}</span>
            </div>
            {formElements.length > 0 && scanState !== 'idle' && scanState !== 'stopped' && (
              <div className="step-detail-item">
                <span className="detail-label">Current Form:</span>
                <span className="detail-value">
                  {currentFormIndex + 1} of {formElements.length}
                </span>
              </div>
            )}
            <div className="step-progress-bar">
              <div 
                className={`step-progress-fill ${
                  scanState === 'stopped' ? 'failed' : 
                  scanState === 'paused' ? 'paused' : 
                  ''
                }`} 
                style={{ width: `${scanProgress}%` }}
              ></div>
            </div>
            <div className="step-notes">
              <p>
                {scanState === 'scanning' ? 'Scanning form elements on the page...' : 
                 scanState === 'paused' ? 'Scan paused. Click Resume to continue.' : 
                 scanState === 'stopped' ? 'Scan stopped. Click Start to try again.' : 
                 scanState === 'complete' ? `Found ${formElements.length} form(s) on the page.` :
                 'Ready to scan page for form elements.'}
              </p>
            </div>
            
            {/* Form Details Section */}
            {formElements.length > 0 && scanState === 'complete' && (
              <div className="forms-details-list">
                <h4>Forms Found:</h4>
                <div className="forms-list">
                  {formElements.map((form) => renderFormDetails(form))}
                </div>
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  const statusInfo = getStatusInfo();

  // Download the HTML content of the current page
  const downloadPageHTML = async () => {
    if (!webviewRef.current) return;
    
    try {
      // Get the HTML content
      const html = await webviewRef.current.executeJavaScript(`
        (function() {
          try {
            return document.documentElement.outerHTML;
          } catch (err) {
            console.error('Error getting page HTML:', err);
            return 'Error getting HTML: ' + err.message;
          }
        })();
      `);
      
      // Create a blob and download link
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const a = document.createElement('a');
      const filename = new URL(browserUrl).hostname || 'page';
      a.href = url;
      a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.html`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error('Error downloading HTML:', error);
    }
  };

  // Enable manual selection mode
  const enableManualSelectionMode = async () => {
    if (!webviewRef.current) return;
    
    // Toggle the state
    setIsManualSelectionMode(prev => !prev);
    
    if (!isManualSelectionMode) {
      // If enabling, inject the selection helper
      await webviewRef.current.executeJavaScript(`
        (function() {
          // Remove any existing helpers
          if (window.formSelectorHelper) {
            document.removeEventListener('click', window.formSelectorHelper);
            const existingMessage = document.getElementById('ph-form-selection-msg');
            if (existingMessage) existingMessage.remove();
            document.body.style.cursor = '';
          }
          
          // Set-up click handler
          window.formSelectorHelper = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Find the most relevant containing element
            let targetElement = e.target;
            
            // Check if it's a small element like an input, try to get a container
            if (targetElement.tagName.toLowerCase() === 'input' || 
                targetElement.tagName.toLowerCase() === 'select' ||
                targetElement.tagName.toLowerCase() === 'textarea' ||
                targetElement.tagName.toLowerCase() === 'button') {
                
              // Try to find a parent form
              let parent = targetElement.parentElement;
              while (parent && parent !== document.body) {
                if (parent.tagName.toLowerCase() === 'form' || 
                    parent.classList.contains('form-group') ||
                    parent.classList.contains('rjsf') ||
                    parent.tagName.toLowerCase() === 'fieldset') {
                  targetElement = parent;
                  break;
                }
                parent = parent.parentElement;
              }
            }
            
            // Get element information
            const rect = targetElement.getBoundingClientRect();
            const formInfo = {
              element: targetElement.tagName.toLowerCase(),
              classes: targetElement.className,
              id: targetElement.id || '',
              x: rect.left + window.scrollX,
              y: rect.top + window.scrollY,
              width: rect.width,
              height: rect.height,
              inputCount: targetElement.querySelectorAll('input, select, textarea').length
            };
            
            // Send info back to the app
            window.electronBridge.sendFormSelection(formInfo);
            
            // Show a brief message to confirm selection
            const toast = document.createElement('div');
            toast.style.position = 'fixed';
            toast.style.bottom = '20px';
            toast.style.left = '50%';
            toast.style.transform = 'translateX(-50%)';
            toast.style.backgroundColor = '#00FF85';
            toast.style.color = 'black';
            toast.style.padding = '8px 16px';
            toast.style.borderRadius = '4px';
            toast.style.zIndex = '10000';
            toast.style.fontSize = '14px';
            toast.style.fontWeight = 'bold';
            toast.textContent = 'Form selected!';
            document.body.appendChild(toast);
            
            // Remove the toast after 1.5 seconds
            setTimeout(() => {
              if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 1500);
            
            return false;
          };
          
          // Add the event listener and change cursor
          document.addEventListener('click', window.formSelectorHelper, true);
          document.body.style.cursor = 'crosshair';
          
          // Add a message to show user they're in selection mode
          const message = document.createElement('div');
          message.id = 'ph-form-selection-msg';
          message.style.position = 'fixed';
          message.style.top = '10px';
          message.style.left = '50%';
          message.style.transform = 'translateX(-50%)';
          message.style.backgroundColor = '#FF00FF';
          message.style.color = 'white';
          message.style.padding = '8px 16px';
          message.style.borderRadius = '4px';
          message.style.zIndex = '10000';
          message.style.fontWeight = 'bold';
          message.textContent = 'Click on form elements to select them';
          document.body.appendChild(message);
        })();
      `);
      
      // Set up communication channel from webview to receive selection events
      webviewRef.current.addEventListener('ipc-message', (event) => {
        if (event.channel === 'form-selection') {
          const formInfo = event.args[0];
          
          // Add to our manually selected forms
          setManuallySelectedForms(prev => [...prev, {
            ...formInfo,
            id: formInfo.id || `selected-form-${prev.length}`,
            index: prev.length,
            type: formInfo.element === 'form' ? 'traditional' : 'container'
          }]);
        }
      });
    } else {
      // If disabling, remove the helpers
      await webviewRef.current.executeJavaScript(`
        (function() {
          if (window.formSelectorHelper) {
            document.removeEventListener('click', window.formSelectorHelper);
            document.body.style.cursor = '';
            
            const message = document.getElementById('ph-form-selection-msg');
            if (message) message.remove();
          }
        })();
      `);
    }
  };
  
  // Save current manual selections for this URL
  const saveManualSelections = () => {
    if (manuallySelectedForms.length > 0) {
      setSavedSelections(prev => ({
        ...prev,
        [browserUrl]: manuallySelectedForms
      }));
      
      // Turn off selection mode
      if (isManualSelectionMode) {
        enableManualSelectionMode();
      }
    }
  };
  
  // Combine auto-detected and manually saved forms
  useEffect(() => {
    if (savedSelections[browserUrl] && savedSelections[browserUrl].length > 0) {
      // If we have saved selections for this URL, add them to detected forms
      setFormElements(prev => {
        // Create a combined list without duplicates
        const combinedForms = [...prev];
        
        // Add saved selections that don't overlap with auto-detected forms
        savedSelections[browserUrl].forEach(savedForm => {
          // Check if there's a similar form already (using position as proxy)
          const isDuplicate = combinedForms.some(existingForm => 
            Math.abs(existingForm.x - savedForm.x) < 20 && 
            Math.abs(existingForm.y - savedForm.y) < 20 &&
            Math.abs(existingForm.width - savedForm.width) < 20
          );
          
          if (!isDuplicate) {
            combinedForms.push({
              ...savedForm,
              index: combinedForms.length,
              isManuallySelected: true
            });
          }
        });
        
        return combinedForms;
      });
    }
  }, [savedSelections, browserUrl]);

  // Update the render for form details to show manually selected forms
  const renderFormDetails = (form) => {
    return (
      <div key={form.id} className={`form-detail-item ${form.isManuallySelected ? 'manually-selected' : ''}`} onClick={() => scrollToForm(form.index)}>
        <div className="form-detail-header">
          <span className="form-number">{form.index + 1}.</span>
          <span className="form-id">{form.id}</span>
          <span className={`form-type ${form.type}`}>
            {form.type === 'traditional' ? 'Standard Form' : 
             form.type === 'react-schema' ? 'React Schema Form' :
             form.type === 'fieldset' ? 'Fieldset Form' :
             'Container'}
          </span>
          {form.isManuallySelected && (
            <span className="manually-selected-badge">Manual Selection</span>
          )}
        </div>
        <div className="form-detail-body">
          <div className="form-detail-row">
            <span className="detail-label">Inputs:</span>
            <span className="detail-value">{form.inputCount}</span>
          </div>
          <div className="form-detail-row">
            <span className="detail-label">Element:</span>
            <span className="detail-value">{form.element || 'div'}</span>
          </div>
          <div className="form-detail-row">
            <span className="detail-label">Position:</span>
            <span className="detail-value">{Math.round(form.x)},{Math.round(form.y)}</span>
          </div>
          <div className="form-detail-row">
            <span className="detail-label">Size:</span>
            <span className="detail-value">{Math.round(form.width)}x{Math.round(form.height)}</span>
          </div>
        </div>
        <button className="view-form-btn" onClick={(e) => {
          e.stopPropagation();
          scrollToForm(form.index);
        }}>
          View
        </button>
      </div>
    );
  };

  // Load user profile from localStorage
  const getUserProfile = () => {
    try {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        return JSON.parse(savedProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
    
    // Return a default empty profile if nothing found
    return {
      personalInfo: {},
      workExperience: [],
      education: [],
      skills: [],
      links: [],
      preferences: {
        autofillEnabled: true,
        automaticSubmit: false,
        fillTimeout: 500
      }
    };
  };

  // Get form fields mapping patterns
  const getFieldMappings = () => {
    return {
      firstName: [
        /first.*name/i, 
        /given.*name/i, 
        /^name$/i,
        /^fname$/i, 
        /^first$/i
      ],
      middleName: [
        /middle.*name/i, 
        /^mname$/i,
        /^middle$/i,
        /^mi$/i
      ],
      lastName: [
        /last.*name/i, 
        /surname/i, 
        /family.*name/i, 
        /^lname$/i,
        /^last$/i
      ],
      email: [
        /email/i, 
        /e-mail/i,
        /^mail$/i
      ],
      phone: [
        /phone/i, 
        /telephone/i, 
        /mobile/i, 
        /cell/i
      ],
      phoneCountryCode: [
        /country.*code/i,
        /phone.*country/i,
        /country.*phone/i
      ],
      phoneExtension: [
        /ext/i,
        /extension/i
      ],
      address1: [
        /address.*1/i, 
        /address.*line.*1/i, 
        /street.*address/i, 
        /^address$/i,
        /^addr$/i,
        /^street$/i
      ],
      address2: [
        /address.*2/i, 
        /address.*line.*2/i, 
        /apt/i, 
        /apartment/i, 
        /unit/i, 
        /suite/i
      ],
      city: [
        /city/i, 
        /town/i, 
        /municipality/i
      ],
      state: [
        /state/i, 
        /province/i, 
        /region/i
      ],
      zipCode: [
        /zip/i, 
        /postal.*code/i, 
        /postcode/i
      ],
      country: [
        /country/i, 
        /nation/i
      ],
      // Source/referral field
      source: [
        /source/i,
        /referral/i,
        /referred/i, 
        /how.*did.*you.*hear/i,
        /how.*did.*you.*find/i
      ]
    };
  };

  // Detect form fields and their types
  const detectFormFields = async (formIndex) => {
    if (!webviewRef.current || !formElements[formIndex]) return [];
    
    const form = formElements[formIndex];
    
    try {
      const formFields = await webviewRef.current.executeJavaScript(`
        (function() {
          try {
            // Find the form element to analyze
            let formElement;
            
            // For traditional <form> elements
            if ('${form.type}' === 'traditional') {
              const forms = document.querySelectorAll('form');
              if (forms.length > ${formIndex}) {
                formElement = forms[${formIndex}];
              }
            }
            // For containers or other form-like elements
            else {
              // Try to find it by coordinates
              const allElements = document.elementsFromPoint(${form.x + form.width/2}, ${form.y + form.height/2});
              
              for (const el of allElements) {
                if ((el.tagName === 'FORM' || 
                    el.tagName === 'FIELDSET' || 
                    el.classList.contains('rjsf') ||
                    el.classList.contains('form-group')) &&
                    !el.hidden) {
                  formElement = el;
                  break;
                }
              }
              
              // If not found, try by ID
              if (!formElement && '${form.id}') {
                formElement = document.getElementById('${form.id}');
              }
            }
            
            if (!formElement) {
              // Use document.body as fallback to search for inputs 
              // in the general area of the detected form
              formElement = document.body;
            }
            
            // Find all interactive elements
            const inputFields = formElement.querySelectorAll('input, select, textarea');
            
            // Process each field to get its metadata
            const fieldData = Array.from(inputFields).map(field => {
              // Skip hidden fields
              if (field.type === 'hidden' || 
                  field.style.display === 'none' || 
                  field.style.visibility === 'hidden' ||
                  field.hidden) {
                return null;
              }
              
              // Get the field's label (using various methods)
              let label = '';
              let labelElement = null;
              
              // Method 1: Check for explicit label
              if (field.id) {
                labelElement = document.querySelector(\`label[for="\${field.id}"]\`);
                if (labelElement) {
                  label = labelElement.textContent.trim();
                }
              }
              
              // Method 2: Check for parent label
              if (!label && field.closest('label')) {
                label = field.closest('label').textContent.trim().replace(field.value, '');
              }
              
              // Method 3: Check for adjacent label in common patterns
              if (!label) {
                // Check previous sibling or parent's previous child
                const parent = field.parentElement;
                const prevSibling = field.previousElementSibling;
                const parentPrevSibling = parent ? parent.previousElementSibling : null;
                
                if (prevSibling && prevSibling.tagName === 'LABEL') {
                  label = prevSibling.textContent.trim();
                } else if (parentPrevSibling && parentPrevSibling.tagName === 'LABEL') {
                  label = parentPrevSibling.textContent.trim();
                }
              }
              
              // Method 4: Check for aria-label and placeholder
              if (!label) {
                label = field.getAttribute('aria-label') || 
                        field.getAttribute('placeholder') || 
                        field.name || '';
              }
              
              // Get field attributes and determine type
              let fieldType = field.type || 'text';
              const isRequired = field.required || field.getAttribute('aria-required') === 'true';
              const fieldName = field.name || '';
              const fieldId = field.id || '';
              const fieldClass = field.className || '';
              const placeholder = field.getAttribute('placeholder') || '';
              const autocomplete = field.getAttribute('autocomplete') || '';
              const fieldValue = field.value || '';
              
              // Handle select options for dropdowns
              const selectOptions = fieldType === 'select-one' ? 
                Array.from(field.options).map(option => ({
                  value: option.value,
                  text: option.text,
                  selected: option.selected
                })) : [];
              
              // Try to determine the semantic field type
              let semanticType = '';
              
              // Check autocomplete attribute
              if (autocomplete) {
                if (autocomplete.includes('given-name')) semanticType = 'firstName';
                else if (autocomplete.includes('family-name')) semanticType = 'lastName';
                else if (autocomplete.includes('email')) semanticType = 'email';
                else if (autocomplete.includes('tel')) semanticType = 'phone';
                else if (autocomplete.includes('street-address') || autocomplete.includes('address-line1')) 
                  semanticType = 'address1';
                else if (autocomplete.includes('address-line2')) semanticType = 'address2';
                else if (autocomplete.includes('address-level2')) semanticType = 'city';
                else if (autocomplete.includes('address-level1')) semanticType = 'state';
                else if (autocomplete.includes('postal-code')) semanticType = 'zipCode';
                else if (autocomplete.includes('country')) semanticType = 'country';
              }
              
              // Use label to guess type if we still don't know
              if (!semanticType) {
                const labelLower = label.toLowerCase();
                const nameLower = fieldName.toLowerCase();
                const idLower = fieldId.toLowerCase();
                const placeholder_lower = placeholder.toLowerCase();
                
                // First name patterns
                if (/first|given|fname/i.test(labelLower) || 
                    /first|given|fname/i.test(nameLower) || 
                    /first|given|fname/i.test(idLower) ||
                    /first|given|fname/i.test(placeholder_lower)) {
                  semanticType = 'firstName';
                }
                // Last name patterns
                else if (/last|surname|family|lname/i.test(labelLower) || 
                        /last|surname|family|lname/i.test(nameLower) || 
                        /last|surname|family|lname/i.test(idLower) ||
                        /last|surname|family|lname/i.test(placeholder_lower)) {
                  semanticType = 'lastName';
                }
                // Email patterns
                else if (/email|e-mail/i.test(labelLower) || 
                        /email|e-mail/i.test(nameLower) || 
                        /email|e-mail/i.test(idLower) ||
                        /email|e-mail/i.test(placeholder_lower) ||
                        fieldType === 'email') {
                  semanticType = 'email';
                }
                // Phone patterns
                else if (/phone|mobile|cell|tel/i.test(labelLower) || 
                        /phone|mobile|cell|tel/i.test(nameLower) || 
                        /phone|mobile|cell|tel/i.test(idLower) ||
                        /phone|mobile|cell|tel/i.test(placeholder_lower)) {
                  semanticType = 'phone';
                }
                // Address patterns
                else if (/address.*1|address.*line.*1|street/i.test(labelLower) || 
                        /address.*1|address.*line.*1|street/i.test(nameLower) || 
                        /address.*1|address.*line.*1|street/i.test(idLower) ||
                        /address.*1|address.*line.*1|street/i.test(placeholder_lower)) {
                  semanticType = 'address1';
                }
                else if (/address.*2|address.*line.*2|apt|unit|suite/i.test(labelLower) || 
                        /address.*2|address.*line.*2|apt|unit|suite/i.test(nameLower) || 
                        /address.*2|address.*line.*2|apt|unit|suite/i.test(idLower) ||
                        /address.*2|address.*line.*2|apt|unit|suite/i.test(placeholder_lower)) {
                  semanticType = 'address2';
                }
                // City patterns
                else if (/city|town|municipality/i.test(labelLower) || 
                        /city|town|municipality/i.test(nameLower) || 
                        /city|town|municipality/i.test(idLower) ||
                        /city|town|municipality/i.test(placeholder_lower)) {
                  semanticType = 'city';
                }
                // State patterns
                else if (/state|province|region/i.test(labelLower) || 
                        /state|province|region/i.test(nameLower) || 
                        /state|province|region/i.test(idLower) ||
                        /state|province|region/i.test(placeholder_lower)) {
                  semanticType = 'state';
                }
                // Zip code patterns
                else if (/zip|postal.*code|postcode/i.test(labelLower) || 
                        /zip|postal.*code|postcode/i.test(nameLower) || 
                        /zip|postal.*code|postcode/i.test(idLower) ||
                        /zip|postal.*code|postcode/i.test(placeholder_lower)) {
                  semanticType = 'zipCode';
                }
                // Country patterns
                else if (/country|nation/i.test(labelLower) || 
                        /country|nation/i.test(nameLower) || 
                        /country|nation/i.test(idLower) ||
                        /country|nation/i.test(placeholder_lower)) {
                  semanticType = 'country';
                }
                // Source/how did you hear patterns
                else if (/source|referral|referred|how.*did.*you.*hear|how.*did.*you.*find/i.test(labelLower) || 
                        /source|referral|referred|how.*did.*you.*hear|how.*did.*you.*find/i.test(nameLower) || 
                        /source|referral|referred|how.*did.*you.*hear|how.*did.*you.*find/i.test(idLower)) {
                  semanticType = 'source';
                }
              }
              
              // Get actual DOM element position for interactive filling
              const rect = field.getBoundingClientRect();
              const position = {
                x: rect.left + window.scrollX + rect.width / 2,
                y: rect.top + window.scrollY + rect.height / 2
              };
              
              return {
                element: field.tagName.toLowerCase(),
                type: fieldType,
                name: fieldName,
                id: fieldId,
                label,
                placeholder,
                required: isRequired,
                autocomplete,
                className: fieldClass,
                value: fieldValue,
                semanticType,
                options: selectOptions,
                position,
                path: getElementPath(field) // Helper to get unique path to element
              };
            }).filter(field => field !== null);
            
            // Helper to get DOM path
            function getElementPath(element) {
              const path = [];
              while (element && element !== document.body) {
                let selector = element.tagName.toLowerCase();
                if (element.id) {
                  selector += '#' + element.id;
                } else if (element.className) {
                  selector += '.' + Array.from(element.classList).join('.');
                }
                path.unshift(selector);
                element = element.parentElement;
              }
              return path.join(' > ');
            }
            
            return fieldData;
          } catch (err) {
            console.error('Error detecting form fields:', err);
            return [];
          }
        })();
      `);
      
      return formFields || [];
    } catch (error) {
      console.error('Error executing JavaScript in webview:', error);
      return [];
    }
  };

  // Autofill a form with user profile data
  const autofillForm = async (formIndex) => {
    // Reset autofill status
    setAutofillStatus({
      active: true,
      formIndex,
      fieldsFound: 0,
      fieldsFilled: 0,
      completed: false,
      error: null
    });
    
    try {
      // Detect the form fields
      const fields = await detectFormFields(formIndex);
      
      if (!fields || fields.length === 0) {
        setAutofillStatus(prev => ({
          ...prev,
          active: false,
          error: 'No form fields detected'
        }));
        return;
      }
      
      // Get the user profile
      const userProfile = getUserProfile();
      
      // Get the field mappings
      const fieldMappings = getFieldMappings();
      
      // Update field count
      setAutofillStatus(prev => ({
        ...prev,
        fieldsFound: fields.length
      }));
      
      // Determine fill delay - progressive filling looks more natural
      const fillDelay = userProfile.preferences.fillTimeout || 500;
      
      // Track filled fields
      let filledFields = 0;
      
      // Fill each field sequentially
      for (const field of fields) {
        // Skip if field has no semanticType or is already filled
        if (!field.semanticType && !matchFieldToProfile(field, fieldMappings, userProfile)) {
          continue;
        }
        
        // Get the value to fill
        const valueToFill = getValueForField(field, fieldMappings, userProfile);
        
        if (valueToFill === null || valueToFill === undefined) {
          continue;
        }
        
        // Fill the field
        const filled = await fillField(field, valueToFill, fillDelay);
        
        if (filled) {
          filledFields++;
          setAutofillStatus(prev => ({
            ...prev,
            fieldsFilled: filledFields
          }));
        }
        
        // Pause between fills to avoid detection
        if (fillDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, fillDelay));
        }
      }
      
      // Update status when complete
      setAutofillStatus(prev => ({
        ...prev,
        active: false,
        completed: true,
        fieldsFilled: filledFields
      }));
      
      // Auto-proceed to next step if configured
      if (userProfile.preferences.automaticSubmit && fields.length > 0 && filledFields > 0) {
        await clickNextOrSubmit();
      }
    } catch (error) {
      console.error('Error autofilling form:', error);
      setAutofillStatus(prev => ({
        ...prev,
        active: false,
        error: error.message
      }));
    }
  };

  // Match a field to a profile property
  const matchFieldToProfile = (field, fieldMappings, userProfile) => {
    // First check if field already has a semanticType
    if (field.semanticType && userProfile.personalInfo[field.semanticType]) {
      return true;
    }
    
    // If not, try to match using field attributes
    const fieldAttributes = [
      field.label,
      field.name,
      field.id,
      field.placeholder
    ].filter(Boolean).map(attr => attr.toLowerCase());
    
    // Check all field mappings
    for (const [profileKey, patterns] of Object.entries(fieldMappings)) {
      // Skip if no value in user profile
      if (!userProfile.personalInfo[profileKey]) continue;
      
      for (const pattern of patterns) {
        if (fieldAttributes.some(attr => pattern.test(attr))) {
          field.semanticType = profileKey;
          return true;
        }
      }
    }
    
    return false;
  };

  // Get the value to fill for a specific field
  const getValueForField = (field, fieldMappings, userProfile) => {
    // Handle special cases for dropdowns
    if (field.type === 'select-one' && field.options && field.options.length > 0) {
      // Handle country selection
      if (field.semanticType === 'country') {
        const country = userProfile.personalInfo.country || '';
        
        // Look for exact or partial match in options
        const exactMatch = field.options.find(opt => 
          opt.text.trim().toLowerCase() === country.toLowerCase() || 
          opt.value.trim().toLowerCase() === country.toLowerCase()
        );
        
        if (exactMatch) return exactMatch.value;
        
        // Try partial match (e.g., "United States" vs "United States of America")
        const partialMatch = field.options.find(opt => 
          opt.text.toLowerCase().includes(country.toLowerCase()) || 
          country.toLowerCase().includes(opt.text.toLowerCase()) ||
          opt.value.toLowerCase().includes(country.toLowerCase()) || 
          country.toLowerCase().includes(opt.value.toLowerCase())
        );
        
        if (partialMatch) return partialMatch.value;
        
        // For USA/US special cases
        if (country.toLowerCase() === 'usa' || country.toLowerCase() === 'us' || 
            country.toLowerCase() === 'united states' || country.toLowerCase() === 'united states of america') {
          const usMatch = field.options.find(opt => 
            /united states|america|usa|us/i.test(opt.text) || 
            /united states|america|usa|us/i.test(opt.value)
          );
          
          if (usMatch) return usMatch.value;
        }
      }
      
      // Handle state selection
      if (field.semanticType === 'state') {
        const state = userProfile.personalInfo.state || '';
        
        // Look for exact or partial match
        const exactMatch = field.options.find(opt => 
          opt.text.trim().toLowerCase() === state.toLowerCase() || 
          opt.value.trim().toLowerCase() === state.toLowerCase()
        );
        
        if (exactMatch) return exactMatch.value;
        
        // Handle state abbreviations vs full names
        // This is a simple mapping - extend as needed
        const stateAbbreviations = {
          'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
          'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
          'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
          'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
          'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
          'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
          'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
          'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
          'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
          'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
          'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
          'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
          'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia'
        };
        
        // Map full names to abbreviations
        const fullToAbbr = {};
        Object.entries(stateAbbreviations).forEach(([abbr, full]) => {
          fullToAbbr[full.toLowerCase()] = abbr;
        });
        
        // Check if state is an abbreviation that needs to be expanded
        if (state.length === 2 && stateAbbreviations[state.toUpperCase()]) {
          const fullName = stateAbbreviations[state.toUpperCase()];
          const fullMatch = field.options.find(opt => 
            opt.text.toLowerCase() === fullName.toLowerCase() || 
            opt.value.toLowerCase() === fullName.toLowerCase()
          );
          
          if (fullMatch) return fullMatch.value;
        }
        
        // Check if state is a full name that needs to be abbreviated
        if (fullToAbbr[state.toLowerCase()]) {
          const abbr = fullToAbbr[state.toLowerCase()];
          const abbrMatch = field.options.find(opt => 
            opt.text.toLowerCase() === abbr.toLowerCase() || 
            opt.value.toLowerCase() === abbr.toLowerCase()
          );
          
          if (abbrMatch) return abbrMatch.value;
        }
      }
      
      // Handle source/referral fields
      if (field.semanticType === 'source') {
        // Common values for "how did you hear about us"
        const commonSources = ['Internet', 'Social Media', 'Website', 'Job Board', 'LinkedIn', 'Indeed', 
                              'Referral', 'Friend', 'Recruiter', 'Career Fair', 'Other'];
        
        // Try to find a reasonable option
        for (const source of commonSources) {
          const match = field.options.find(opt => 
            opt.text.toLowerCase().includes(source.toLowerCase())
          );
          
          if (match) return match.value;
        }
        
        // Default to first non-empty option as fallback
        const firstOption = field.options.find(opt => opt.value && opt.value !== '');
        if (firstOption) return firstOption.value;
      }
    }
    
    // For regular fields, get value from profile
    if (field.semanticType && userProfile.personalInfo[field.semanticType]) {
      return userProfile.personalInfo[field.semanticType];
    }
    
    return null;
  };

  // Fill a field with a value
  const fillField = async (field, value, delay) => {
    if (!webviewRef.current) return false;
    
    try {
      // Special handling for select dropdowns
      if (field.type === 'select-one') {
        return await webviewRef.current.executeJavaScript(`
          (function() {
            try {
              // Find the element
              const element = document.querySelector(\`${field.path}\`);
              if (!element) return false;
              
              // Set the value and trigger change event
              element.value = "${value}";
              
              // Trigger events
              const changeEvent = new Event('change', { bubbles: true });
              element.dispatchEvent(changeEvent);
              
              const inputEvent = new Event('input', { bubbles: true });
              element.dispatchEvent(inputEvent);
              
              return true;
            } catch (err) {
              console.error('Error filling select field:', err);
              return false;
            }
          })();
        `);
      } 
      // Handle checkboxes
      else if (field.type === 'checkbox') {
        return await webviewRef.current.executeJavaScript(`
          (function() {
            try {
              // Find the element
              const element = document.querySelector(\`${field.path}\`);
              if (!element) return false;
              
              // Set the checked state based on boolean value
              element.checked = ${Boolean(value)};
              
              // Trigger change event
              const changeEvent = new Event('change', { bubbles: true });
              element.dispatchEvent(changeEvent);
              
              return true;
            } catch (err) {
              console.error('Error filling checkbox field:', err);
              return false;
            }
          })();
        `);
      }
      // Handle radio buttons
      else if (field.type === 'radio') {
        return await webviewRef.current.executeJavaScript(`
          (function() {
            try {
              // Find the element
              const element = document.querySelector(\`${field.path}\`);
              if (!element) return false;
              
              // Only check if the value matches
              if (element.value === "${value}") {
                element.checked = true;
                
                // Trigger change event
                const changeEvent = new Event('change', { bubbles: true });
                element.dispatchEvent(changeEvent);
                
                return true;
              }
              
              return false;
            } catch (err) {
              console.error('Error filling radio field:', err);
              return false;
            }
          })();
        `);
      }
      // Handle text fields and all other types
      else {
        return await webviewRef.current.executeJavaScript(`
          (function() {
            try {
              // Find the element
              const element = document.querySelector(\`${field.path}\`);
              if (!element) return false;
              
              // Focus the field
              element.focus();
              
              // Type the value character by character to simulate human typing
              element.value = "";
              
              // Fill the value instantly but split by short delays
              element.value = "${value}";
              
              // Trigger events
              const inputEvent = new Event('input', { bubbles: true });
              element.dispatchEvent(inputEvent);
              
              const changeEvent = new Event('change', { bubbles: true });
              element.dispatchEvent(changeEvent);
              
              // Blur the field
              element.blur();
              
              return true;
            } catch (err) {
              console.error('Error filling text field:', err);
              return false;
            }
          })();
        `);
      }
    } catch (error) {
      console.error('Error executing JavaScript in webview:', error);
      return false;
    }
  };

  // Try to click Next or Submit button
  const clickNextOrSubmit = async () => {
    if (!webviewRef.current) return false;
    
    try {
      return await webviewRef.current.executeJavaScript(`
        (function() {
          try {
            // Common patterns for "Next" and "Submit" buttons
            const nextPatterns = [
              'button[type="submit"]',
              'input[type="submit"]',
              'button:contains("Next")',
              'button:contains("Continue")',
              'button:contains("Submit")',
              'a:contains("Next")',
              'a:contains("Continue")',
              'a:contains("Submit")',
              '.next-button',
              '.submit-button',
              '.continue-button'
            ];
            
            // Custom implementation of :contains which is not standard
            function findElementsContainingText(selector, text) {
              const elements = document.querySelectorAll(selector);
              return Array.from(elements).filter(el => 
                el.textContent.toLowerCase().includes(text.toLowerCase())
              );
            }
            
            // Try each pattern
            for (const pattern of nextPatterns) {
              if (pattern.includes(':contains(')) {
                const [baseSelector, textToFind] = pattern.split(':contains(');
                const textSearch = textToFind.slice(0, -1); // Remove closing )
                const elements = findElementsContainingText(baseSelector, textSearch);
                
                if (elements.length > 0) {
                  // Find the one most likely to be the submit button (most visible, most centered)
                  const submitBtn = elements[0];
                  submitBtn.click();
                  return true;
                }
              } else {
                const elements = document.querySelectorAll(pattern);
                if (elements.length > 0) {
                  elements[0].click();
                  return true;
                }
              }
            }
            
            return false;
          } catch (err) {
            console.error('Error clicking next/submit:', err);
            return false;
          }
        })();
      `);
    } catch (error) {
      console.error('Error executing JavaScript in webview:', error);
      return false;
    }
  };

  return (
    <div className="page-finder-template">
      <div className="page-finder-container">
        <div className="page-finder-browser">
          <div className="mini-browser-controls">
            <button 
              className="mini-browser-nav-btn"
              disabled={!canGoBack}
              onClick={browserGoBack}
            >
              <ChevronLeft size={14} />
            </button>
            <button 
              className="mini-browser-nav-btn"
              disabled={!canGoForward}
              onClick={browserGoForward}
            >
              <ChevronRight size={14} />
            </button>
            <input 
              type="text" 
              className="mini-url-input" 
              value={browserUrl}
              onChange={(e) => setBrowserUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  // Ensure URL has proper format
                  let url = e.target.value;
                  if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    url = 'https://' + url;
                    setBrowserUrl(url);
                  }
                  // Navigate to new URL
                  if (webviewRef.current) {
                    webviewRef.current.src = url;
                  }
                }
              }}
            />
            <button 
              className="mini-browser-refresh-btn"
              onClick={browserRefresh}
            >
              <RefreshCw size={14} />
            </button>
            <button 
              className="mini-browser-download-btn"
              onClick={downloadPageHTML}
              title="Download page HTML"
            >
              <Download size={14} />
            </button>
          </div>
          <div className="mini-browser-container">
            <webview 
              src={browserUrl}
              style={{width: '100%', height: '100%'}}
              allowpopups="true"
            ></webview>
          </div>
        </div>
        
        <div className="page-finder-tracker">
          <div className="form-selection-controls">
            <button 
              className={`select-forms-btn ${isManualSelectionMode ? 'active' : ''}`}
              onClick={enableManualSelectionMode}
              title="Click to manually select forms in the page"
            >
              {isManualSelectionMode ? 'Cancel Selection' : 'Select Forms Manually'}
            </button>
            
            {manuallySelectedForms.length > 0 && (
              <button 
                className="save-selections-btn"
                onClick={saveManualSelections}
                title="Save your manual form selections for this URL"
              >
                Save Selections ({manuallySelectedForms.length})
              </button>
            )}
          </div>
          
          <div className="progress-tracker-container">
            {renderScanningPanel()}
          </div>
          
          <div className="composite-progress">
            <div className="composite-progress-status">
              <div className="status-icon">
                {statusInfo.icon}
              </div>
              <div className="status-message">
                {statusInfo.message}
              </div>
              {statusInfo.showProgress && (
                <div className="status-percentage">
                  {scanProgress}%
                </div>
              )}
            </div>
            
            {statusInfo.showProgress && (
              <div className="composite-progress-bar">
                <div 
                  className={`composite-progress-fill ${
                    scanState === 'stopped' ? 'failed' : 
                    scanState === 'paused' ? 'paused' : 
                    ''
                  }`} 
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
            )}
          </div>
          
          <div className="tracker-controls">
            {scanState === 'idle' || scanState === 'stopped' || scanState === 'complete' ? (
              <button 
                className="tracker-btn start-btn"
                onClick={handleStart}
              >
                <Play size={16} />
                Start
              </button>
            ) : (
              <button 
                className="tracker-btn stop-btn"
                onClick={handleStop}
              >
                <Square size={16} />
                Stop
              </button>
            )}
            
            <button 
              className={`tracker-btn pause-btn ${scanState !== 'scanning' && scanState !== 'paused' ? 'disabled' : ''}`}
              onClick={handlePause}
              disabled={scanState !== 'scanning' && scanState !== 'paused'}
            >
              {scanState === 'paused' ? (
                <>
                  <Play size={16} />
                  Resume
                </>
              ) : (
                <>
                  <Pause size={16} />
                  Pause
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="page-finder-footer">
        <button className="back-button" onClick={onComplete}>
          <ArrowLeft size={16} />
          Back to Templates
        </button>
      </div>
    </div>
  );
};

export default PageFinder;