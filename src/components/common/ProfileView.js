import React from 'react';
import { X, User, Mail, Phone, Shield, CreditCard, LogOut } from 'lucide-react';

const ProfileView = ({ onClose }) => {
  return (
    <div className="profile-view-overlay">
      <div className="profile-view-container">
        <button className="profile-close-btn" onClick={onClose}>
          <X size={18} />
        </button>
        
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={36} />
          </div>
          <h2>Ethan Pae</h2>
          <p>Admin Account</p>
        </div>
        
        <div className="profile-details">
          <div className="profile-detail-item">
            <Mail size={16} />
            <span>pae_ethan@yahoo.com</span>
          </div>
          <div className="profile-detail-item">
            <Phone size={16} />
            <span>+1 (800) 588-2300</span>
          </div>
          <div className="profile-detail-item">
            <Shield size={16} />
            <span>Premium Member</span>
          </div>
          <div className="profile-detail-item">
            <CreditCard size={16} />
            <span>Visa ending in 1985</span>
          </div>
        </div>
        
        <div className="profile-actions">
          <button className="profile-action-btn">Edit Profile</button>
          <button className="profile-action-btn logout">
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileView; 