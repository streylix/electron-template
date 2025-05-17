import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Inbox, Users, FileText, Settings, Bell, Calendar, PieChart, TrendingUp, CreditCard, User, Shield, Globe, ChevronLeft, ChevronRight, RefreshCw, Check, X } from 'lucide-react';
import ProfileView from '../common/ProfileView';
import TransitionContainer from '../common/TransitionContainer';
import LoadingCircle from '../common/LoadingCircle';
import { useSnackBar } from '../../App';

const SidebarContentPage = ({ onComplete }) => {
  const [selectedItem, setSelectedItem] = useState(1); // Default to first item
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testLoadingProgress, setTestLoadingProgress] = useState(0);
  const [browserUrl, setBrowserUrl] = useState('https://www.google.com');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState({}); // Track which steps are expanded
  const [stepStatuses, setStepStatuses] = useState({
    1: 'complete',
    2: 'in-progress',
    3: 'pending',
    4: 'pending'
  });
  const [isProgressSimulating, setIsProgressSimulating] = useState(false);
  const [progressValues, setProgressValues] = useState({
    1: 100,
    2: 67,
    3: 0,
    4: 0
  });
  const simulationTimers = useRef([]);
  const webviewRef = useRef(null);
  const { showSnackBar } = useSnackBar();
  
  // Sample list items for the sidebar
  const sidebarItems = [
    { id: 1, title: 'Dashboard', icon: <PieChart size={18} /> },
    { id: 2, title: 'Activity', icon: <TrendingUp size={18} /> },
    { id: 3, title: 'Payments', icon: <CreditCard size={18} /> },
    { id: 4, title: 'Notifications', icon: <Bell size={18} /> },
    { id: 5, title: 'Calendar', icon: <Calendar size={18} /> },
    { id: 6, title: 'Settings', icon: <Settings size={18} /> },
    { id: 7, title: 'Browser', icon: <Globe size={18} /> },
  ];
  
  // Dashboard card data
  const dashboardCards = [
    { 
      id: 1, 
      title: 'Total Balance', 
      value: '$12,493.00',
      change: '+$2,346.25',
      changePercent: '+14.2%',
      isPositive: true 
    },
    { 
      id: 2, 
      title: 'Monthly Spending', 
      value: '$3,256.90',
      change: '-$124.35',
      changePercent: '-2.8%',
      isPositive: false 
    },
    { 
      id: 3, 
      title: 'Savings Goal', 
      value: '$5,000.00',
      progress: 68,
      remaining: '$1,600 to go'
    }
  ];

  // Recent activity data
  const recentActivity = [
    { 
      id: 1, 
      title: 'Grocery Shopping',
      date: 'May 15, 2025',
      amount: '-$124.95',
      category: 'Food & Dining',
      isPositive: false
    },
    { 
      id: 2, 
      title: 'Salary Deposit',
      date: 'May 12, 2025',
      amount: '+$3,450.00',
      category: 'Income',
      isPositive: true
    },
    { 
      id: 3, 
      title: 'Electric Bill',
      date: 'May 10, 2025',
      amount: '-$89.43',
      category: 'Utilities',
      isPositive: false
    },
    { 
      id: 4, 
      title: 'Freelance Payment',
      date: 'May 8, 2025',
      amount: '+$650.00',
      category: 'Income',
      isPositive: true
    }
  ];
  
  // Handle profile click
  const handleProfileClick = () => {
    setIsProfileOpen(true);
  };
  
  // Handle profile close
  const handleProfileClose = () => {
    setIsProfileOpen(false);
  };
  
  // Test loading section
  const startTestLoading = () => {
    setIsTestLoading(true);
    setTestLoadingProgress(0);
    
    // Simulate loading process with progress updates
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsTestLoading(false);
          setTestLoadingProgress(0);
        }, 500);
      }
      setTestLoadingProgress(progress);
    }, 500);
  };
  
  // Toggle step expansion in progress tracker
  const toggleStepExpansion = (stepId) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };
  
  // Clear all simulation timers
  const clearAllTimers = () => {
    simulationTimers.current.forEach(timer => clearTimeout(timer));
    simulationTimers.current = [];
  };
  
  // Simulate progress tracker steps with real-time progress calculation
  const simulateProgressTracker = () => {
    if (isProgressSimulating) return;
    
    setIsProgressSimulating(true);
    clearAllTimers();
    
    // Reset steps
    setStepStatuses({
      1: 'complete',
      2: 'in-progress',
      3: 'pending',
      4: 'pending'
    });
    
    setProgressValues({
      1: 100,
      2: 0,
      3: 0,
      4: 0
    });
    
    // Simulate step 2 progress incrementing from 0 to 100%
    let step2Progress = 0;
    const step2Interval = 50; // Update every 50ms
    const step2Duration = 3000; // Complete in 3 seconds
    const step2Increment = 100 / (step2Duration / step2Interval);
    
    const updateStep2 = () => {
      step2Progress += step2Increment;
      if (step2Progress >= 100) {
        step2Progress = 100;
        setProgressValues(prev => ({ ...prev, 2: 100 }));
        setStepStatuses(prev => ({
          ...prev,
          2: 'complete',
          3: 'in-progress'
        }));
        
        // Start step 3 progress after step 2 completes
        let step3Progress = 0;
        const step3Interval = 50;
        const step3Duration = 4000; // Complete in 4 seconds
        const step3Increment = 100 / (step3Duration / step3Interval);
        
        const updateStep3 = () => {
          step3Progress += step3Increment;
          if (step3Progress >= 100) {
            step3Progress = 100;
            setProgressValues(prev => ({ ...prev, 3: 100 }));
            setStepStatuses(prev => ({
              ...prev,
              3: 'complete',
              4: 'in-progress'
            }));
            
            // Start step 4 progress after step 3 completes
            let step4Progress = 0;
            const step4Interval = 50;
            const step4Duration = 3000; // Run for 3 seconds before failing
            const step4Increment = 50 / (step4Duration / step4Interval); // Only reach 50% before failing
            
            const updateStep4 = () => {
              step4Progress += step4Increment;
              if (step4Progress >= 50) { // Fail at 50%
                setProgressValues(prev => ({ ...prev, 4: 50 }));
                
                // Set to failed after a short delay
                const failTimer = setTimeout(() => {
                  setStepStatuses(prev => ({
                    ...prev,
                    4: 'failed'
                  }));
                  setIsProgressSimulating(false);
                  
                  // Expand step 4 to show failure details
                  setExpandedSteps(prev => ({
                    ...prev,
                    4: true
                  }));
                }, 500);
                
                simulationTimers.current.push(failTimer);
                return;
              }
              
              setProgressValues(prev => ({ ...prev, 4: Math.round(step4Progress) }));
              const timer = setTimeout(updateStep4, step4Interval);
              simulationTimers.current.push(timer);
            };
            
            const step4StartTimer = setTimeout(updateStep4, 500);
            simulationTimers.current.push(step4StartTimer);
            return;
          }
          
          setProgressValues(prev => ({ ...prev, 3: Math.round(step3Progress) }));
          const timer = setTimeout(updateStep3, step3Interval);
          simulationTimers.current.push(timer);
        };
        
        const step3StartTimer = setTimeout(updateStep3, 500);
        simulationTimers.current.push(step3StartTimer);
        return;
      }
      
      setProgressValues(prev => ({ ...prev, 2: Math.round(step2Progress) }));
      const timer = setTimeout(updateStep2, step2Interval);
      simulationTimers.current.push(timer);
    };
    
    const initialTimer = setTimeout(updateStep2, 500);
    simulationTimers.current.push(initialTimer);
  };
  
  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);
  
  // Test snackbar
  const testSnackBar = (type) => {
    const messages = {
      success: 'Operation completed successfully!',
      error: 'Error: Something went wrong',
      warning: 'Warning: Check your account status',
      info: 'Your account has been updated'
    };
    
    showSnackBar(
      messages[type], 
      type, 
      type === 'error' ? 'Try Again' : 'Dismiss', 
      () => console.log(`Action clicked for ${type}`)
    );
  };
  
  // Initialize webview event listeners
  useEffect(() => {
    const setupWebview = () => {
      const webview = document.querySelector('webview');
      if (webview) {
        webviewRef.current = webview;
        
        // Update URL when navigation finishes
        webview.addEventListener('did-navigate', (e) => {
          setBrowserUrl(e.url);
          setCanGoBack(webview.canGoBack());
          setCanGoForward(webview.canGoForward());
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
        });
      }
    };
    
    // We need to wait a bit for the webview to be rendered
    if (selectedItem === 7) {
      const timer = setTimeout(setupWebview, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedItem]);

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
  
  // Sample content for each item
  const getItemContent = (itemId) => {
    const items = {
      1: {
        title: 'Dashboard',
        description: 'Overview of your financial status and important metrics.',
        component: (
          <div className="dashboard-content">
            <div className="card-grid">
              {dashboardCards.map(card => (
                <div key={card.id} className="dashboard-card">
                  <div className="card-header">
                    <h3>{card.title}</h3>
                  </div>
                  <div className="card-body">
                    <div className="card-value">{card.value}</div>
                    {card.change && (
                      <div className={`card-change ${card.isPositive ? 'positive' : 'negative'}`}>
                        {card.change} <span>({card.changePercent})</span>
                      </div>
                    )}
                    {card.progress !== undefined && (
                      <div className="progress-container">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${card.progress}%` }}></div>
                        </div>
                        <div className="progress-text">{card.remaining}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="section-title">
              <h2>Recent Activity</h2>
              <button className="view-all-btn">View All</button>
            </div>
            
            <div className="activity-list">
              {recentActivity.map(item => (
                <div key={item.id} className="activity-item">
                  <div className="activity-icon">
                    <div className={`icon-bg ${item.isPositive ? 'positive' : 'negative'}`}>
                      {item.isPositive ? <TrendingUp size={16} /> : <CreditCard size={16} />}
                    </div>
                  </div>
                  <div className="activity-details">
                    <div className="activity-title">{item.title}</div>
                    <div className="activity-category">{item.category} • {item.date}</div>
                  </div>
                  <div className={`activity-amount ${item.isPositive ? 'positive' : 'negative'}`}>
                    {item.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      },
      2: {
        title: 'Activity',
        description: 'Track your recent transactions and financial activity.',
        component: (
          <div className="activity-content">
            <div className="section-title">
              <h2>All Transactions</h2>
              <div className="filter-controls">
                <select className="filter-select">
                  <option>All Categories</option>
                  <option>Income</option>
                  <option>Expenses</option>
                  <option>Transfers</option>
                </select>
                <select className="filter-select">
                  <option>This Month</option>
                  <option>Last Month</option>
                  <option>Last 3 Months</option>
                  <option>Custom Range</option>
                </select>
              </div>
            </div>
            
            <div className="activity-list large">
              {[...recentActivity, ...recentActivity].map((item, index) => (
                <div key={`ext-${index}`} className="activity-item">
                  <div className="activity-icon">
                    <div className={`icon-bg ${item.isPositive ? 'positive' : 'negative'}`}>
                      {item.isPositive ? <TrendingUp size={16} /> : <CreditCard size={16} />}
                    </div>
                  </div>
                  <div className="activity-details">
                    <div className="activity-title">{item.title}</div>
                    <div className="activity-category">{item.category} • {item.date}</div>
                  </div>
                  <div className={`activity-amount ${item.isPositive ? 'positive' : 'negative'}`}>
                    {item.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      },
      3: {
        title: 'Payments',
        description: 'Manage your payment methods and scheduled transfers.',
        component: (
          <div className="payments-content">
            <div className="card-grid payments-grid">
              <div className="dashboard-card payment-card">
                <div className="card-header">
                  <h3>Payment Methods</h3>
                </div>
                <div className="card-body">
                  <div className="payment-methods">
                    <div className="payment-method active">
                      <div className="payment-method-icon"><CreditCard size={20} /></div>
                      <div className="payment-method-details">
                        <div className="payment-method-name">Visa ending in 4582</div>
                        <div className="payment-method-exp">Expires 09/26</div>
                      </div>
                      <div className="payment-method-default">Default</div>
                    </div>
                    <div className="payment-method">
                      <div className="payment-method-icon"><CreditCard size={20} /></div>
                      <div className="payment-method-details">
                        <div className="payment-method-name">Mastercard ending in 8245</div>
                        <div className="payment-method-exp">Expires 12/25</div>
                      </div>
                    </div>
                    <button className="add-payment-btn">+ Add Payment Method</button>
                  </div>
                </div>
              </div>
              
              <div className="dashboard-card scheduled-card">
                <div className="card-header">
                  <h3>Scheduled Payments</h3>
                </div>
                <div className="card-body">
                  <div className="scheduled-payments">
                    <div className="scheduled-payment">
                      <div className="scheduled-payment-details">
                        <div className="scheduled-payment-name">Rent Payment</div>
                        <div className="scheduled-payment-date">May 31, 2025</div>
                      </div>
                      <div className="scheduled-payment-amount">$1,450.00</div>
                    </div>
                    <div className="scheduled-payment">
                      <div className="scheduled-payment-details">
                        <div className="scheduled-payment-name">Internet Bill</div>
                        <div className="scheduled-payment-date">June 5, 2025</div>
                      </div>
                      <div className="scheduled-payment-amount">$79.99</div>
                    </div>
                    <div className="scheduled-payment">
                      <div className="scheduled-payment-details">
                        <div className="scheduled-payment-name">Car Insurance</div>
                        <div className="scheduled-payment-date">June 10, 2025</div>
                      </div>
                      <div className="scheduled-payment-amount">$138.75</div>
                    </div>
                    <button className="schedule-payment-btn">+ Schedule Payment</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      },
      4: {
        title: 'Notifications',
        description: 'All system notifications and alerts for your account.',
        details: [
          { label: 'Unread', value: '14' },
          { label: 'Today', value: '8' },
          { label: 'This Week', value: '32' },
          { label: 'Flagged', value: '5' },
        ]
      },
      5: {
        title: 'Calendar',
        description: 'View and manage your upcoming events and meetings.',
        details: [
          { label: 'Today', value: '3 events' },
          { label: 'This Week', value: '12 events' },
          { label: 'Upcoming', value: '8 events' },
          { label: 'Past Due', value: '2 tasks' },
        ]
      },
      6: {
        title: 'Settings',
        description: 'Customize your application settings and preferences.',
        component: (
          <div className="settings-content">
            <div className="card-grid">
              <div className="dashboard-card settings-card">
                <div className="card-header">
                  <h3>Testing Features</h3>
                </div>
                <div className="card-body">
                  <div className="settings-section">
                    <h4>Loading Test</h4>
                    <p>Test the loading transition container</p>
                    <button 
                      className="settings-button"
                      onClick={startTestLoading}
                      disabled={isTestLoading}
                    >
                      Test Loading Section
                    </button>
                    
                    <div className="transition-test-container">
                      <TransitionContainer 
                        loading={isTestLoading}
                        loadingComponent={
                          <div className="test-loading-component">
                            <LoadingCircle size={50} />
                            <div className="progress-container">
                              <div className="progress-bar">
                                <div 
                                  className="progress-fill" 
                                  style={{ width: `${testLoadingProgress}%` }}
                                ></div>
                              </div>
                              <p>Loading test content... {Math.round(testLoadingProgress)}%</p>
                            </div>
                          </div>
                        }
                      >
                        <div className="test-content">
                          <h5>Test Content Area</h5>
                          <p>This content will transition to a loading state when you click the button above.</p>
                          <p>It demonstrates a vertical crossfade transition between content and loading states.</p>
                        </div>
                      </TransitionContainer>
                    </div>
                  </div>
                  
                  <div className="settings-section">
                    <h4>Progress Tracker</h4>
                    <p>Test multi-step progress indicator with status feedback</p>
                    <button 
                      className="settings-button"
                      onClick={simulateProgressTracker}
                      disabled={isProgressSimulating}
                    >
                      {isProgressSimulating ? 'Simulating...' : 'Simulate Progress Tracker'}
                    </button>
                    <div className="progress-tracker-container">
                      <div className="progress-step">
                        <div className={`step-status ${stepStatuses[1]}`}>
                          {stepStatuses[1] === 'complete' ? <Check size={16} /> : 
                           stepStatuses[1] === 'in-progress' ? <LoadingCircle size={16} /> : '⭘'}
                        </div>
                        <div className="step-label">Step 1: Planning</div>
                        <div className="step-percentage complete">{progressValues[1]}%</div>
                        <button 
                          className="view-details-btn"
                          onClick={() => toggleStepExpansion(1)}
                        >
                          {expandedSteps[1] ? 'Hide' : 'Details'}
                        </button>
                      </div>
                      {expandedSteps[1] && (
                        <div className="step-details">
                          <div className="step-detail-item">
                            <span className="detail-label">Started:</span>
                            <span className="detail-value">May 10, 2025</span>
                          </div>
                          <div className="step-detail-item">
                            <span className="detail-label">Completed:</span>
                            <span className="detail-value">May 12, 2025</span>
                          </div>
                          <div className="step-detail-item">
                            <span className="detail-label">Status:</span>
                            <span className="detail-value success">Complete</span>
                          </div>
                          <div className="step-notes">
                            <p>All planning documents have been approved and requirements finalized.</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="progress-step">
                        <div className={`step-status ${stepStatuses[2]}`}>
                          {stepStatuses[2] === 'complete' ? <Check size={16} /> : 
                           stepStatuses[2] === 'in-progress' ? <LoadingCircle size={16} /> : '⭘'}
                        </div>
                        <div className={`step-label ${stepStatuses[2] === 'in-progress' ? 'loading' : ''}`}>
                          {stepStatuses[2] === 'in-progress' ? 'Step in progress...' : 'Step 2: Development'}
                        </div>
                        <div className={`step-percentage ${stepStatuses[2]}`}>
                          {progressValues[2]}%
                        </div>
                        <button 
                          className="view-details-btn"
                          onClick={() => toggleStepExpansion(2)}
                        >
                          {expandedSteps[2] ? 'Hide' : 'Details'}
                        </button>
                      </div>
                      {expandedSteps[2] && (
                        <div className="step-details">
                          <div className="step-detail-item">
                            <span className="detail-label">Started:</span>
                            <span className="detail-value">May 13, 2025</span>
                          </div>
                          <div className="step-detail-item">
                            <span className="detail-label">Progress:</span>
                            <span className="detail-value">{progressValues[2]}%</span>
                          </div>
                          <div className="step-detail-item">
                            <span className="detail-label">Status:</span>
                            <span className={`detail-value ${stepStatuses[2] === 'in-progress' ? 'in-progress' : stepStatuses[2]}`}>
                              {stepStatuses[2] === 'complete' ? 'Complete' : 
                               stepStatuses[2] === 'in-progress' ? 'In Progress' : 'Pending'}
                            </span>
                          </div>
                          {stepStatuses[2] === 'in-progress' && (
                            <div className="step-progress-bar">
                              <div className="step-progress-fill" style={{ width: `${progressValues[2]}%` }}></div>
                            </div>
                          )}
                          <div className="step-notes">
                            <p>Core functionality implemented. Working on UI components and integrations.</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="progress-step">
                        <div className={`step-status ${stepStatuses[3]}`}>
                          {stepStatuses[3] === 'complete' ? <Check size={16} /> : 
                           stepStatuses[3] === 'in-progress' ? <LoadingCircle size={16} /> : '⭘'}
                        </div>
                        <div className={`step-label ${stepStatuses[3] === 'in-progress' ? 'loading' : ''}`}>
                          {stepStatuses[3] === 'in-progress' ? 'Step in progress...' : 'Step 3: Testing'}
                        </div>
                        <div className={`step-percentage ${stepStatuses[3]}`}>
                          {progressValues[3]}%
                        </div>
                        <button 
                          className="view-details-btn"
                          onClick={() => toggleStepExpansion(3)}
                        >
                          {expandedSteps[3] ? 'Hide' : 'Details'}
                        </button>
                      </div>
                      {expandedSteps[3] && (
                        <div className="step-details">
                          <div className="step-detail-item">
                            <span className="detail-label">
                              {stepStatuses[3] === 'in-progress' || stepStatuses[3] === 'complete' ? 'Started:' : 'Expected Start:'}
                            </span>
                            <span className="detail-value">May 20, 2025</span>
                          </div>
                          {(stepStatuses[3] === 'in-progress' || stepStatuses[3] === 'complete') && (
                            <div className="step-detail-item">
                              <span className="detail-label">Progress:</span>
                              <span className="detail-value">{progressValues[3]}%</span>
                            </div>
                          )}
                          <div className="step-detail-item">
                            <span className="detail-label">Status:</span>
                            <span className={`detail-value ${stepStatuses[3]}`}>
                              {stepStatuses[3] === 'complete' ? 'Complete' : 
                               stepStatuses[3] === 'in-progress' ? 'In Progress' : 'Pending'}
                            </span>
                          </div>
                          {stepStatuses[3] === 'in-progress' && (
                            <div className="step-progress-bar">
                              <div className="step-progress-fill" style={{ width: `${progressValues[3]}%` }}></div>
                            </div>
                          )}
                          <div className="step-notes">
                            <p>
                              {stepStatuses[3] === 'complete' ? 'All tests completed successfully.' :
                               stepStatuses[3] === 'in-progress' ? 'Running test suite. Integration tests in progress.' :
                               'Test plan prepared. Waiting for development phase to complete.'}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="progress-step">
                        <div className={`step-status ${stepStatuses[4]}`}>
                          {stepStatuses[4] === 'complete' ? <Check size={16} /> : 
                           stepStatuses[4] === 'in-progress' ? <LoadingCircle size={16} /> : 
                           stepStatuses[4] === 'failed' ? <X size={16} /> : '⭘'}
                        </div>
                        <div className={`step-label ${stepStatuses[4] === 'in-progress' ? 'loading' : ''}`}>
                          {stepStatuses[4] === 'in-progress' ? 'Step in progress...' : 'Step 4: Deployment'}
                        </div>
                        <div className={`step-percentage ${stepStatuses[4]}`}>
                          {progressValues[4]}%
                        </div>
                        <button 
                          className="view-details-btn"
                          onClick={() => toggleStepExpansion(4)}
                        >
                          {expandedSteps[4] ? 'Hide' : 'Details'}
                        </button>
                      </div>
                      {expandedSteps[4] && (
                        <div className="step-details">
                          {stepStatuses[4] === 'failed' ? (
                            <>
                              <div className="step-detail-item">
                                <span className="detail-label">Started:</span>
                                <span className="detail-value">May 27, 2025</span>
                              </div>
                              <div className="step-detail-item">
                                <span className="detail-label">Progress:</span>
                                <span className="detail-value">{progressValues[4]}%</span>
                              </div>
                              <div className="step-detail-item">
                                <span className="detail-label">Status:</span>
                                <span className="detail-value failed">Failed</span>
                              </div>
                              <div className="step-detail-item">
                                <span className="detail-label">Error Code:</span>
                                <span className="detail-value failed">ERR-5432</span>
                              </div>
                              <div className="step-progress-bar">
                                <div className="step-progress-fill" style={{ width: `${progressValues[4]}%`, backgroundColor: 'rgba(255, 0, 153, 0.5)' }}></div>
                              </div>
                              <div className="step-notes error-notes">
                                <p>Deployment failed: Database migration error. Unable to establish connection to production server.</p>
                                <p>Check server logs for more details and try again after fixing the connection issue.</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="step-detail-item">
                                <span className="detail-label">
                                  {stepStatuses[4] === 'in-progress' ? 'Started:' : 'Expected Start:'}
                                </span>
                                <span className="detail-value">May 27, 2025</span>
                              </div>
                              {stepStatuses[4] === 'in-progress' && (
                                <div className="step-detail-item">
                                  <span className="detail-label">Progress:</span>
                                  <span className="detail-value">{progressValues[4]}%</span>
                                </div>
                              )}
                              <div className="step-detail-item">
                                <span className="detail-label">Status:</span>
                                <span className={`detail-value ${stepStatuses[4]}`}>
                                  {stepStatuses[4] === 'in-progress' ? 'In Progress' : 'Pending'}
                                </span>
                              </div>
                              {stepStatuses[4] === 'in-progress' && (
                                <div className="step-progress-bar">
                                  <div className="step-progress-fill" style={{ width: `${progressValues[4]}%` }}></div>
                                </div>
                              )}
                              <div className="step-notes">
                                <p>
                                  {stepStatuses[4] === 'in-progress' ? 
                                    'Deploying to production environment. Setting up database migrations.' : 
                                    'Infrastructure preparation in progress. Deployment scripts ready.'}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="settings-section">
                    <h4>Snackbar Test</h4>
                    <p>Test different types of snackbar notifications</p>
                    <div className="snackbar-test-buttons">
                      <button 
                        className="settings-button success"
                        onClick={() => testSnackBar('success')}
                      >
                        Success
                      </button>
                      <button 
                        className="settings-button error"
                        onClick={() => testSnackBar('error')}
                      >
                        Error
                      </button>
                      <button 
                        className="settings-button warning"
                        onClick={() => testSnackBar('warning')}
                      >
                        Warning
                      </button>
                      <button 
                        className="settings-button info"
                        onClick={() => testSnackBar('info')}
                      >
                        Info
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="dashboard-card settings-card">
                <div className="card-header">
                  <h3>Profile Settings</h3>
                </div>
                <div className="card-body settings-list">
                  <div className="settings-item">
                    <div className="settings-item-label">Profile</div>
                    <div className="settings-item-value">Complete</div>
                  </div>
                  <div className="settings-item">
                    <div className="settings-item-label">Security</div>
                    <div className="settings-item-value">Enhanced</div>
                  </div>
                  <div className="settings-item">
                    <div className="settings-item-label">Notifications</div>
                    <div className="settings-item-value">Enabled</div>
                  </div>
                  <div className="settings-item">
                    <div className="settings-item-label">Theme</div>
                    <div className="settings-item-value">Dark Mode</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      },
      7: {
        title: 'Browser',
        description: 'Embedded browser for captchas and manual verification',
        component: (
          <div className="browser-content">
            <div className="browser-controls">
              <button 
                className={`browser-nav-btn ${!canGoBack ? 'disabled' : ''}`}
                onClick={browserGoBack}
                disabled={!canGoBack}
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                className={`browser-nav-btn ${!canGoForward ? 'disabled' : ''}`}
                onClick={browserGoForward}
                disabled={!canGoForward}
              >
                <ChevronRight size={16} />
              </button>
              <input 
                type="text" 
                className="url-input" 
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
                className="browser-refresh-btn"
                onClick={browserRefresh}
              >
                <RefreshCw size={16} />
                <span>Refresh</span>
              </button>
            </div>
            <div className="browser-container">
              {/* Electron webview tag for embedded browser */}
              <webview 
                src={browserUrl}
                style={{width: '100%', height: '100%'}}
                allowpopups="true"
              ></webview>
            </div>
          </div>
        )
      },
    };
    return items[itemId] || null;
  };
  
  const handleItemClick = (itemId) => {
    setSelectedItem(itemId);
  };
  
  const content = getItemContent(selectedItem);
  
  return (
    <div className="sidebar-content-page">
      {/* Profile Overlay */}
      {isProfileOpen && <ProfileView onClose={handleProfileClose} />}
      
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">ST</div>
          <div className="brand-name">Template</div>
        </div>
        
        <div className="sidebar-user" onClick={handleProfileClick}>
          <div className="user-avatar">
            <User size={20} />
          </div>
          <div className="user-info">
            <div className="user-name">Ethan Pae</div>
            <div className="user-role">Admin Account</div>
          </div>
        </div>
        
        <div className="sidebar-title">Main Menu</div>
        <ul className="sidebar-list">
          {sidebarItems.map((item) => (
            <li 
              key={item.id} 
              className={`sidebar-item ${selectedItem === item.id ? 'active' : ''}`}
              onClick={() => handleItemClick(item.id)}
            >
              <div className="sidebar-item-icon">{item.icon}</div>
              <div className="sidebar-item-text">{item.title}</div>
              {item.id === 4 && <div className="notification-badge">3</div>}
            </li>
          ))}
        </ul>
        
        <div className="sidebar-footer">
          <div className="premium-card">
            <div className="premium-icon"><Shield size={18} /></div>
            <div className="premium-text">Upgrade to Premium</div>
          </div>
          <button className="back-button" onClick={onComplete}>
            <ArrowLeft size={16} />
            Back to Templates
          </button>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="content">
        <div className="content-header">
          <div>
            <h1>{content.title}</h1>
            <p>{content.description}</p>
          </div>
          <div className="user-actions">
            <button 
              className="action-button"
              onClick={() => testSnackBar('info')}
            >
              <Bell size={18} />
            </button>
            <button 
              className="action-button"
              onClick={() => handleItemClick(6)}
            >
              <Settings size={18} />
            </button>
            <div 
              className="header-avatar"
              onClick={handleProfileClick}
            >
              <User size={20} />
            </div>
          </div>
        </div>
        
        {content.component ? (
          content.component
        ) : content.details ? (
          <div className="content-details">
            {content.details.map((detail, index) => (
              <div key={index} className="detail-item">
                <strong>{detail.label}:</strong> 
                <span>{detail.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="content-empty">
            <h2>Select an item from the sidebar</h2>
            <p>The content will display here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarContentPage; 