import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, PlusCircle, Trash2, Briefcase, GraduationCap, Award, Link, FileText } from 'lucide-react';

const UserProfile = ({ onComplete }) => {
  // Load saved profile or use defaults
  const [profile, setProfile] = useState(() => {
    const savedProfile = localStorage.getItem('userProfile');
    return savedProfile ? JSON.parse(savedProfile) : {
      personalInfo: {
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phone: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
      },
      workExperience: [],
      education: [],
      skills: [],
      links: [],
      preferences: {
        autofillEnabled: true,
        automaticSubmit: false,
        fillTimeout: 500,
      }
    };
  });

  // Save profile to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }, [profile]);

  // Update personal info fields
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [name]: value
      }
    }));
  };

  // Work experience methods
  const addWorkExperience = () => {
    setProfile(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, {
        id: Date.now(),
        company: '',
        title: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      }]
    }));
  };

  const updateWorkExperience = (id, field, value) => {
    setProfile(prev => ({
      ...prev,
      workExperience: prev.workExperience.map(job => 
        job.id === id ? { ...job, [field]: value } : job
      )
    }));
  };

  const deleteWorkExperience = (id) => {
    setProfile(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter(job => job.id !== id)
    }));
  };

  // Education methods
  const addEducation = () => {
    setProfile(prev => ({
      ...prev,
      education: [...prev.education, {
        id: Date.now(),
        school: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      }]
    }));
  };

  const updateEducation = (id, field, value) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const deleteEducation = (id) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  // Skills methods
  const addSkill = () => {
    setProfile(prev => ({
      ...prev,
      skills: [...prev.skills, {
        id: Date.now(),
        name: '',
        proficiency: 'Intermediate'
      }]
    }));
  };

  const updateSkill = (id, field, value) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.map(skill => 
        skill.id === id ? { ...skill, [field]: value } : skill
      )
    }));
  };

  const deleteSkill = (id) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== id)
    }));
  };

  // Links methods
  const addLink = () => {
    setProfile(prev => ({
      ...prev,
      links: [...prev.links, {
        id: Date.now(),
        label: '',
        url: ''
      }]
    }));
  };

  const updateLink = (id, field, value) => {
    setProfile(prev => ({
      ...prev,
      links: prev.links.map(link => 
        link.id === id ? { ...link, [field]: value } : link
      )
    }));
  };

  const deleteLink = (id) => {
    setProfile(prev => ({
      ...prev,
      links: prev.links.filter(link => link.id !== id)
    }));
  };

  // Preferences methods
  const handlePreferenceChange = (e) => {
    const { name, type, checked, value } = e.target;
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  // Save profile
  const saveProfile = () => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    // Show success message
    alert('Profile saved successfully!');
  };

  return (
    <div className="user-profile-page">
      <div className="profile-header">
        <h1>User Profile for Autofill</h1>
        <div className="profile-actions">
          <button className="save-profile-btn" onClick={saveProfile}>
            <Save size={16} />
            Save Profile
          </button>
          <button className="back-button" onClick={onComplete}>
            <ArrowLeft size={16} />
            Back to Templates
          </button>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h2>Personal Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input 
                type="text" 
                id="firstName" 
                name="firstName" 
                value={profile.personalInfo.firstName}
                onChange={handlePersonalInfoChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="middleName">Middle Name</label>
              <input 
                type="text" 
                id="middleName" 
                name="middleName" 
                value={profile.personalInfo.middleName}
                onChange={handlePersonalInfoChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input 
                type="text" 
                id="lastName" 
                name="lastName" 
                value={profile.personalInfo.lastName}
                onChange={handlePersonalInfoChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={profile.personalInfo.email}
                onChange={handlePersonalInfoChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                value={profile.personalInfo.phone}
                onChange={handlePersonalInfoChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="address1">Address Line 1</label>
              <input 
                type="text" 
                id="address1" 
                name="address1" 
                value={profile.personalInfo.address1}
                onChange={handlePersonalInfoChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="address2">Address Line 2</label>
              <input 
                type="text" 
                id="address2" 
                name="address2" 
                value={profile.personalInfo.address2}
                onChange={handlePersonalInfoChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input 
                type="text" 
                id="city" 
                name="city" 
                value={profile.personalInfo.city}
                onChange={handlePersonalInfoChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input 
                type="text" 
                id="state" 
                name="state" 
                value={profile.personalInfo.state}
                onChange={handlePersonalInfoChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="zipCode">Zip Code</label>
              <input 
                type="text" 
                id="zipCode" 
                name="zipCode" 
                value={profile.personalInfo.zipCode}
                onChange={handlePersonalInfoChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input 
                type="text" 
                id="country" 
                name="country" 
                value={profile.personalInfo.country}
                onChange={handlePersonalInfoChange}
              />
            </div>
          </div>
        </div>

        <div className="profile-section">
          <div className="section-header">
            <h2><Briefcase size={20} /> Work Experience</h2>
            <button className="add-item-btn" onClick={addWorkExperience}>
              <PlusCircle size={16} />
              Add Experience
            </button>
          </div>
          
          {profile.workExperience.map(job => (
            <div className="profile-card" key={job.id}>
              <div className="card-header">
                <div className="card-title">
                  {job.title ? job.title : 'New Position'} 
                  {job.company ? ` at ${job.company}` : ''}
                </div>
                <button className="delete-btn" onClick={() => deleteWorkExperience(job.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="card-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Job Title</label>
                    <input 
                      type="text" 
                      value={job.title}
                      onChange={e => updateWorkExperience(job.id, 'title', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Company</label>
                    <input 
                      type="text" 
                      value={job.company}
                      onChange={e => updateWorkExperience(job.id, 'company', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input 
                      type="text" 
                      value={job.location}
                      onChange={e => updateWorkExperience(job.id, 'location', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input 
                      type="date" 
                      value={job.startDate}
                      onChange={e => updateWorkExperience(job.id, 'startDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input 
                      type="date" 
                      value={job.endDate}
                      disabled={job.current}
                      onChange={e => updateWorkExperience(job.id, 'endDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group checkbox-group">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={job.current}
                        onChange={e => updateWorkExperience(job.id, 'current', e.target.checked)}
                      />
                      I currently work here
                    </label>
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea 
                    rows="3"
                    value={job.description}
                    onChange={e => updateWorkExperience(job.id, 'description', e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>
          ))}
          
          {profile.workExperience.length === 0 && (
            <div className="empty-state">
              <p>No work experience added yet</p>
            </div>
          )}
        </div>

        <div className="profile-section">
          <div className="section-header">
            <h2><GraduationCap size={20} /> Education</h2>
            <button className="add-item-btn" onClick={addEducation}>
              <PlusCircle size={16} />
              Add Education
            </button>
          </div>
          
          {profile.education.map(edu => (
            <div className="profile-card" key={edu.id}>
              <div className="card-header">
                <div className="card-title">
                  {edu.school ? edu.school : 'New Education'} 
                  {edu.degree ? ` - ${edu.degree}` : ''}
                </div>
                <button className="delete-btn" onClick={() => deleteEducation(edu.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="card-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>School</label>
                    <input 
                      type="text" 
                      value={edu.school}
                      onChange={e => updateEducation(edu.id, 'school', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Degree</label>
                    <input 
                      type="text" 
                      value={edu.degree}
                      onChange={e => updateEducation(edu.id, 'degree', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Field of Study</label>
                    <input 
                      type="text" 
                      value={edu.fieldOfStudy}
                      onChange={e => updateEducation(edu.id, 'fieldOfStudy', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input 
                      type="date" 
                      value={edu.startDate}
                      onChange={e => updateEducation(edu.id, 'startDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input 
                      type="date" 
                      value={edu.endDate}
                      disabled={edu.current}
                      onChange={e => updateEducation(edu.id, 'endDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group checkbox-group">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={edu.current}
                        onChange={e => updateEducation(edu.id, 'current', e.target.checked)}
                      />
                      I'm currently studying here
                    </label>
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea 
                    rows="3"
                    value={edu.description}
                    onChange={e => updateEducation(edu.id, 'description', e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>
          ))}
          
          {profile.education.length === 0 && (
            <div className="empty-state">
              <p>No education added yet</p>
            </div>
          )}
        </div>

        <div className="profile-section">
          <div className="section-header">
            <h2><Award size={20} /> Skills</h2>
            <button className="add-item-btn" onClick={addSkill}>
              <PlusCircle size={16} />
              Add Skill
            </button>
          </div>
          
          <div className="skills-grid">
            {profile.skills.map(skill => (
              <div className="skill-item" key={skill.id}>
                <input 
                  type="text" 
                  placeholder="Skill name"
                  value={skill.name}
                  onChange={e => updateSkill(skill.id, 'name', e.target.value)}
                />
                <select 
                  value={skill.proficiency}
                  onChange={e => updateSkill(skill.id, 'proficiency', e.target.value)}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
                <button className="delete-skill-btn" onClick={() => deleteSkill(skill.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          
          {profile.skills.length === 0 && (
            <div className="empty-state">
              <p>No skills added yet</p>
            </div>
          )}
        </div>

        <div className="profile-section">
          <div className="section-header">
            <h2><Link size={20} /> Links</h2>
            <button className="add-item-btn" onClick={addLink}>
              <PlusCircle size={16} />
              Add Link
            </button>
          </div>
          
          <div className="links-grid">
            {profile.links.map(link => (
              <div className="link-item" key={link.id}>
                <input 
                  type="text" 
                  placeholder="Label (e.g. LinkedIn, Portfolio)"
                  value={link.label}
                  onChange={e => updateLink(link.id, 'label', e.target.value)}
                />
                <input 
                  type="url" 
                  placeholder="URL (https://...)"
                  value={link.url}
                  onChange={e => updateLink(link.id, 'url', e.target.value)}
                />
                <button className="delete-link-btn" onClick={() => deleteLink(link.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          
          {profile.links.length === 0 && (
            <div className="empty-state">
              <p>No links added yet</p>
            </div>
          )}
        </div>

        <div className="profile-section">
          <div className="section-header">
            <h2><FileText size={20} /> Autofill Preferences</h2>
          </div>
          
          <div className="preferences-grid">
            <div className="form-group checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  name="autofillEnabled"
                  checked={profile.preferences.autofillEnabled}
                  onChange={handlePreferenceChange}
                />
                Enable autofill when forms are detected
              </label>
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  name="automaticSubmit"
                  checked={profile.preferences.automaticSubmit}
                  onChange={handlePreferenceChange}
                />
                Automatically proceed to next step when form is filled
              </label>
            </div>
            <div className="form-group">
              <label>Fill delay (milliseconds)</label>
              <input 
                type="number" 
                name="fillTimeout"
                value={profile.preferences.fillTimeout}
                onChange={handlePreferenceChange}
                min="0"
                max="2000"
                step="100"
              />
              <span className="form-help">Time delay between filling each field (0-2000ms)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 