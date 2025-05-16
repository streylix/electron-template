import React, { useState } from 'react';
import { ArrowLeft, Inbox, Users, FileText, Settings, Bell, Calendar, PieChart, TrendingUp, CreditCard, User, Shield } from 'lucide-react';
import ProfileView from '../common/ProfileView';
import TransitionContainer from '../common/TransitionContainer';
import LoadingCircle from '../common/LoadingCircle';
import { useSnackBar } from '../../App';

const SidebarContentPage = ({ onComplete }) => {
  const [selectedItem, setSelectedItem] = useState(1); // Default to first item
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testLoadingProgress, setTestLoadingProgress] = useState(0);
  const { showSnackBar } = useSnackBar();
  
  // Sample list items for the sidebar
  const sidebarItems = [
    { id: 1, title: 'Dashboard', icon: <PieChart size={18} /> },
    { id: 2, title: 'Activity', icon: <TrendingUp size={18} /> },
    { id: 3, title: 'Payments', icon: <CreditCard size={18} /> },
    { id: 4, title: 'Notifications', icon: <Bell size={18} /> },
    { id: 5, title: 'Calendar', icon: <Calendar size={18} /> },
    { id: 6, title: 'Settings', icon: <Settings size={18} /> },
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