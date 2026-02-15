import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const emptyEducation = () => ({ degree: '', institution: '', startDate: '', endDate: '' });
const emptyExperience = () => ({ role: '', company: '', startDate: '', endDate: '', description: '' });
const emptyCert = () => ({ title: '', issuer: '', date: '' });

const defaultFormData = () => ({
  name: '', bio: '', avatar: '', location: '', title: '', resume: '',
  careerVision: { role: '', growingInto: '', inspiredBy: '' },
  education: [emptyEducation()], experience: [emptyExperience()],
  certifications: [emptyCert()], skills: [],
  socials: { github: '', linkedin: '' },
});

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [registerData, setRegisterData] = useState({ email: '', password: '' });
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [generatingBio, setGeneratingBio] = useState(false);
  const [navDropdownOpen, setNavDropdownOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Modal states
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [bioModalOpen, setBioModalOpen] = useState(false);
  const [experienceModalOpen, setExperienceModalOpen] = useState(false);
  const [educationModalOpen, setEducationModalOpen] = useState(false);
  const [certificationModalOpen, setCertificationModalOpen] = useState(false);
  const [skillsModalOpen, setSkillsModalOpen] = useState(false);
  const [headerEditModalOpen, setHeaderEditModalOpen] = useState(false);
  
  // Header edit form
  const [headerEditForm, setHeaderEditForm] = useState({
    name: '',
    location: '',
    avatar: '',
    title: '',
    avatarPreview: '',
    growingInto: '',
    role: '',
    inspiredBy: ''
  });
  
  // Edit item states
  const [editingExperience, setEditingExperience] = useState(null);
  const [editingEducation, setEditingEducation] = useState(null);
  const [editingCertification, setEditingCertification] = useState(null);
  
  // Raw skills input (for typing freely with commas)
  const [rawSkillsInput, setRawSkillsInput] = useState("");
  
  const navDropdownRef = useRef(null);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navDropdownRef.current && !navDropdownRef.current.contains(event.target)) {
        setNavDropdownOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/user/profile`, { headers: { Authorization: `Bearer ${token}` } });
      const d = res.data;
      setProfile(d);
      setFormData({
        name: d.name || '', bio: d.bio || '', avatar: d.avatar || '', location: d.location || '', title: d.title || '', resume: d.resume || '',
        careerVision: { role: d.careerVision?.role || '', growingInto: d.careerVision?.growingInto || '', inspiredBy: d.careerVision?.inspiredBy || '' },
        education: (d.education?.length) ? d.education.map(e => ({ degree: e.degree || '', institution: e.institution || '', startDate: e.startDate || '', endDate: e.endDate || '' })) : [emptyEducation()],
        experience: (d.experience?.length) ? d.experience.map(e => ({ role: e.role || '', company: e.company || '', startDate: e.startDate || '', endDate: e.endDate || '', description: e.description || '' })) : [emptyExperience()],
        certifications: (d.certifications?.length) ? d.certifications.map(c => ({ title: c.title || '', issuer: c.issuer || '', date: c.date || '' })) : [emptyCert()],
        skills: d.skills || [],
        socials: { github: d.socials?.github || '', linkedin: d.socials?.linkedin || '' },
      });
    } catch (err) {
      if (err.response?.status === 401) { localStorage.removeItem('token'); delete axios.defaults.headers.common['Authorization']; navigate('/login'); return; }
      setError(err.response?.status === 404 ? 'No profile yet' : err.message);
    } finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'github' || name === 'linkedin') setFormData((p) => ({ ...p, socials: { ...p.socials, [name]: value } }));
    else if (name.startsWith('careerVision.')) setFormData((p) => ({ ...p, careerVision: { ...p.careerVision, [name.split('.')[1]]: value } }));
    else if (name === 'skills') setFormData((p) => ({ ...p, skills: value.split(',').map(s => s.trim()).filter(Boolean) }));
    else setFormData((p) => ({ ...p, [name]: value }));
  };

  const updateArray = (key, index, field, value) => setFormData((p) => { const arr = [...p[key]]; arr[index] = { ...arr[index], [field]: value }; return { ...p, [key]: arr }; });
  const addItem = (key, empty) => setFormData((p) => ({ ...p, [key]: [...p[key], empty()] }));
  const removeItem = (key, index) => setFormData((p) => ({ ...p, [key]: p[key].filter((_, i) => i !== index) }));

  const buildProfilePayload = () => ({
    name: formData.name, bio: formData.bio, avatar: formData.avatar, location: formData.location, title: formData.title, resume: formData.resume,
    careerVision: formData.careerVision,
    education: formData.education.filter(e => e.degree || e.institution),
    experience: formData.experience.filter(e => e.role || e.company),
    certifications: formData.certifications.filter(c => c.title),
    skills: formData.skills, socials: formData.socials,
  });

  const handleSave = async () => {
    try {
      if (!profile) {
        if (!registerData.email || !registerData.password) { setError('Email and password required'); return; }
        await axios.post(`${API_URL}/user/register`, { email: registerData.email, password: registerData.password, profile: buildProfilePayload() });
      } else await axios.put(`${API_URL}/user/profile`, buildProfilePayload());
      await fetchProfile();
      setIsEditing(false);
      setError(null);
    } catch (err) { setError(err.response?.data?.error || err.message); }
  };

  const handleGenerateBio = async () => {
    try {
      setGeneratingBio(true);
      const skills = profile?.skills?.length ? profile.skills : (formData.skills.length ? formData.skills : ['general development']);
      const name = profile?.name || formData.name || 'the user';
      const res = await axios.post(`${API_URL}/ai/bio`, { skills, name });
      const generatedBio = res.data.bio || '';
      
      // Save to backend immediately
      await axios.put(`${API_URL}/user/profile`, { ...profile, bio: generatedBio });
      
      // Update both states
      setProfile(prev => ({ ...prev, bio: generatedBio }));
      setFormData(p => ({ ...p, bio: generatedBio }));
      
      toast.success('Bio generated successfully!');
    } catch (err) { 
      toast.error(err.response?.data?.error || err.message);
    } finally { 
      setGeneratingBio(false); 
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    let score = 0;

    if (profile?.bio) score += 10;
    if (profile?.certifications?.length > 0) score += 15;
    if (profile?.experience?.length > 0) score += 25;
    if (profile?.education?.length > 0) score += 25;
    if (profile?.skills?.length > 0) score += 25;

    return Math.min(score, 100);
  };

  // Modal handlers
  const saveProfile = async (updates) => {
    try {
      setSaving(true);
      const payload = { ...profile, ...updates };
      await axios.put(`${API_URL}/user/profile`, payload);
      await fetchProfile();
      toast.success('Profile updated successfully!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const openExperienceModal = () => {
    setFormData(p => ({ ...p, experience: [emptyExperience()] }));
    setExperienceModalOpen(true);
  };

  const openEducationModal = () => {
    setFormData(p => ({ ...p, education: [emptyEducation()] }));
    setEducationModalOpen(true);
  };

  const openCertificationModal = () => {
    setFormData(p => ({ ...p, certifications: [emptyCert()] }));
    setCertificationModalOpen(true);
  };

  const openHeaderEditModal = () => {
    setHeaderEditForm({
      name: profile?.name || '',
      location: profile?.location || '',
      avatar: profile?.avatar || '',
      title: profile?.title || '',
      avatarPreview: profile?.avatar || '',
      growingInto: profile?.careerVision?.growingInto || '',
      role: profile?.careerVision?.role || '',
      inspiredBy: profile?.careerVision?.inspiredBy || ''
    });
    setHeaderEditModalOpen(true);
  };

  const handleHeaderEditChange = (e) => {
    const { name, value } = e.target;
    setHeaderEditForm(p => ({ ...p, [name]: value }));
    if (name === 'avatar') {
      setHeaderEditForm(p => ({ ...p, avatarPreview: value }));
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeaderEditForm(p => ({ 
          ...p, 
          avatar: reader.result,
          avatarPreview: reader.result 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveHeaderEdit = async (e) => {
    e.preventDefault();
    if (!headerEditForm.name || !headerEditForm.location) {
      toast.error('Name and location are required');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        ...profile,
        name: headerEditForm.name,
        location: headerEditForm.location,
        avatar: headerEditForm.avatar,
        title: headerEditForm.title,
        careerVision: {
          growingInto: headerEditForm.growingInto,
          role: headerEditForm.role,
          inspiredBy: headerEditForm.inspiredBy
        }
      };
      await axios.put(`${API_URL}/user/profile`, payload);
      await fetchProfile();
      toast.success('Profile updated successfully!');
      setHeaderEditModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBasicProfile = async (e) => {
    e.preventDefault();
    const success = await saveProfile({
      name: formData.name,
      title: formData.title,
      location: formData.location,
      bio: formData.bio,
    });
    if (success) setProfileModalOpen(false);
  };

  const handleSaveBio = async (e) => {
    e.preventDefault();
    const success = await saveProfile({ bio: formData.bio });
    if (success) setBioModalOpen(false);
  };

  const handleSaveSkills = async (e) => {
    e.preventDefault();
    
    // Parse raw skills input into array only on save
    const skillsArray = rawSkillsInput
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
    
    // Update formData with parsed skills
    setFormData(prev => ({
      ...prev,
      skills: skillsArray
    }));
    
    // Save to backend
    const success = await saveProfile({ skills: skillsArray });
    if (success) setSkillsModalOpen(false);
  };

  const handleAddExperience = async (e) => {
    e.preventDefault();
    const newExp = formData.experience[formData.experience.length - 1];
    if (!newExp.role || !newExp.company) {
      toast.error('Please fill in role and company');
      return;
    }
    const success = await saveProfile({
      experience: [...(profile.experience || []), newExp]
    });
    if (success) {
      setExperienceModalOpen(false);
      setFormData(p => ({ ...p, experience: [emptyExperience()] }));
    }
  };

  const handleAddEducation = async (e) => {
    e.preventDefault();
    const newEdu = formData.education[formData.education.length - 1];
    if (!newEdu.degree || !newEdu.institution) {
      toast.error('Please fill in degree and institution');
      return;
    }
    const success = await saveProfile({
      education: [...(profile.education || []), newEdu]
    });
    if (success) {
      setEducationModalOpen(false);
      setFormData(p => ({ ...p, education: [emptyEducation()] }));
    }
  };

  const handleAddCertification = async (e) => {
    e.preventDefault();
    const newCert = formData.certifications[formData.certifications.length - 1];
    if (!newCert.title) {
      toast.error('Please enter certification title');
      return;
    }
    const success = await saveProfile({
      certifications: [...(profile.certifications || []), newCert]
    });
    if (success) {
      setCertificationModalOpen(false);
      setFormData(p => ({ ...p, certifications: [emptyCert()] }));
    }
  };

  const inputCls = 'p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm w-full';
  const cardCls = 'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 w-full';

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 text-center text-gray-500 dark:text-gray-400">Loading...</div>;
  if (error && !profile && !isEditing) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center"><div className="max-w-md p-5 text-center"><p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p><button onClick={() => { setError(null); setIsEditing(true); }} className="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded">Create Profile</button></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-[1040px] mx-auto px-3 sm:px-6 h-14 flex items-center justify-between">
          <img src="/Gidy_logo_full_transparent.png" alt="Gidy" className="h-8" />
          <div className="hidden md:flex gap-8 text-sm text-gray-600 dark:text-gray-400">
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition">Jobs</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition">Hackathons</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition">Projects</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition">Tasks</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition">Organization</a>
          </div>
          <div className="relative" ref={navDropdownRef}>
            <button onClick={() => setNavDropdownOpen(!navDropdownOpen)} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {navDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                <button onClick={() => { setNavDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Profile</button>
                <button onClick={() => { handleLogout(); setNavDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Logout</button>
                <button onClick={() => { setNavDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Feedback</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5">
        {/* Dark Mode Toggle */}
        <div className="flex justify-end mb-4">
          <button onClick={() => setDarkMode(!darkMode)} className="px-3 py-1 text-sm rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm">{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
        </div>

        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-4 relative">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {isEditing ? (
              <input name="avatar" value={formData.avatar} onChange={handleChange} placeholder="Avatar URL" className={inputCls} />
            ) : (
              <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center overflow-hidden shrink-0">
                {profile?.avatar ? <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-orange-600 text-3xl font-bold">{profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}</span>}
              </div>
            )}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" className={`${inputCls} font-bold`} />
                  <input name="location" value={formData.location} onChange={handleChange} placeholder="Location" className={inputCls} />
                  <input name="title" value={formData.title} onChange={handleChange} placeholder="Title" className={inputCls} />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">{profile?.name || 'Name'}</h1>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{profile?.title || 'Fresher'} / {profile?.location || 'Graduate'}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{profile?.location || 'Chennai'}</p>
                  <div className="flex items-center gap-1 mt-1 mb-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.email || 'No email found'}</p>
                  </div>
                  {/* Bio */}
                  <div className="mb-3">
                    {profile?.bio ? (
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{profile.bio}</p>
                    ) : (
                      <p className="text-sm text-gray-400 dark:text-gray-500 italic">No bio yet. Generate one!</p>
                    )}
                  </div>
                  
                  {/* Action Buttons - Stacked on mobile, row on desktop */}
                  {!isEditing && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button 
                        onClick={handleGenerateBio} 
                        disabled={generatingBio}
                        className="w-full sm:w-auto px-3 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs rounded-lg hover:from-purple-600 hover:to-blue-600 flex items-center justify-center gap-1.5 transition shadow-sm"
                      >
                        {generatingBio ? (
                          <>
                            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                          </>
                        ) : (
                          <>
                            ✨ Generate Bio
                          </>
                        )}
                      </button>
                      
                      {profile?.resume ? (
                        <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-4 py-1.5 bg-blue-600 text-white text-sm rounded flex items-center justify-center gap-2 hover:bg-blue-700">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download Resume
                        </a>
                      ) : (
                        <button onClick={() => toast.info("Resume download coming soon")} className="w-full sm:w-auto px-4 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded flex items-center justify-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          ⬇ Download Resume
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Rewards Card - Below on mobile, right side on desktop */}
          <div className="w-full sm:w-auto mt-4 sm:mt-0">
            {isEditing && (
              <input name="resume" value={formData.resume} onChange={handleChange} placeholder="Resume URL" className={`${inputCls} w-full mb-3`} />
            )}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-3 shadow-sm w-full">
              <div className="flex items-center justify-center gap-4 sm:gap-8 mb-2">
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase mb-0.5">League</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Bronze</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase mb-0.5">Rank</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">26</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase mb-0.5">Points</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">80</p>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <button onClick={() => navigate('/rewards')} className="text-xs text-orange-500 dark:text-orange-400 hover:text-orange-600 flex items-center justify-center gap-1 w-full">
                  View My Rewards
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Edit and Menu buttons - Absolute positioned on desktop, inline on mobile */}
          <div className="flex gap-2 items-center mt-3 sm:mt-0 sm:absolute sm:right-4 sm:top-4">
            <button onClick={openHeaderEditModal} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Edit Profile">
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <div className="relative" ref={profileMenuRef}>
              <button onClick={() => setProfileMenuOpen(!profileMenuOpen)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                  <button onClick={() => { setProfileModalOpen(true); setProfileMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Edit Profile</button>
                  <button onClick={() => { handleLogout(); setProfileMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Career Vision Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-5 mb-4 w-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-medium text-gray-400 dark:text-gray-500">Your Career Vision</h2>
            </div>
            <button onClick={openHeaderEditModal} className="text-gray-400 hover:text-blue-600 text-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-2">What you're growing into</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{profile?.careerVision?.growingInto || 'Add your vision'}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-2">The space you want to grow in</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{profile?.careerVision?.role || 'Add your target space'}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-2">Inspired by</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{profile?.careerVision?.inspiredBy || 'Add your inspiration'}</p>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column */}
          <div className="space-y-4 w-full">
            {/* Level Up Profile */}
            {!isEditing && (
              <div className={cardCls}>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Level Up Profile</h3>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-2">Just a few clicks away from accelerating, complete your profile</p>
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500 dark:text-gray-400">Progress:</span>
                    <span className="text-gray-900 dark:text-white font-semibold">{calculateCompletion()}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-1.5 bg-green-500 rounded-full transition-all duration-500" style={{width: `${calculateCompletion()}%`}}></div>
                  </div>
                </div>
                <div className="space-y-2 mt-3">
                  <button onClick={() => setBioModalOpen(true)} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 w-full transition">
                    <span className={profile?.bio ? "text-green-500" : "text-gray-400"}>●</span>
                    <span>Complete Your Bio</span>
                    <span className="ml-auto text-[10px] text-green-600 dark:text-green-400">+10%</span>
                  </button>
                  <button onClick={openCertificationModal} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 w-full transition">
                    <span className={profile?.certifications?.length > 0 ? "text-green-500" : "text-gray-400"}>●</span>
                    <span>Upload Your Certificate</span>
                    <span className="ml-auto text-[10px] text-green-600 dark:text-green-400">+15%</span>
                  </button>
                  <button onClick={openExperienceModal} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 w-full transition">
                    <span className={profile?.experience?.length > 0 ? "text-green-500" : "text-gray-400"}>●</span>
                    <span>Add Your Experience</span>
                    <span className="ml-auto text-[10px] text-green-600 dark:text-green-400">+25%</span>
                  </button>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">Tell us about yourself in a few words</p>
                </div>
              </div>
            )}

            {/* Skills */}
            <div className={cardCls}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Skills</h3>
                <button onClick={() => {
                  setRawSkillsInput(profile?.skills?.join(", ") || "");
                  setSkillsModalOpen(true);
                }} className="text-blue-600 text-xs hover:text-blue-700">●●●</button>
              </div>
              {(profile?.skills?.length > 0) ? (
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((s, i) => <span key={i} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs">{s}</span>)}
                </div>
              ) : <p className="text-sm text-gray-400">Add your skills</p>}
            </div>

            {/* Socials */}
            {isEditing && (
              <div className={cardCls}>
                <h3 className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Social Links</h3>
                <div className="space-y-2">
                  <input name="github" value={formData.socials.github} onChange={handleChange} placeholder="GitHub URL" className={inputCls} />
                  <input name="linkedin" value={formData.socials.linkedin} onChange={handleChange} placeholder="LinkedIn URL" className={inputCls} />
                </div>
              </div>
            )}
            {!isEditing && ((profile?.socials?.github) || (profile?.socials?.linkedin)) && (
              <div className={cardCls}>
                <h3 className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Social Links</h3>
                <div className="space-y-2">
                  {profile.socials.github && <a href={profile.socials.github} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline block">GitHub</a>}
                  {profile.socials.linkedin && <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline block">LinkedIn</a>}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-4 w-full">
            {/* Experience */}
            <div className={cardCls}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Experience</h3>
                <button onClick={openExperienceModal} className="text-blue-600 text-lg leading-none hover:text-blue-700">+</button>
              </div>
              {(profile?.experience?.length > 0 && profile.experience.some(e => e.role || e.company)) ? (
                <div className="space-y-3">
                  {profile.experience.map((e, i) => (e.role || e.company) && (
                    <div key={i}>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{e.role}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{e.company}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">{e.startDate} - {e.endDate}</p>
                      {e.description && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{e.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <button onClick={openExperienceModal} className="w-full py-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center gap-2 text-sm text-orange-500 dark:text-orange-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <span className="text-lg">⭐</span>
                  Add Your Experience!
                </button>
              )}
            </div>

            {/* Education */}
            <div className={cardCls}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Education</h3>
                <button onClick={openEducationModal} className="text-blue-600 text-lg leading-none hover:text-blue-700">+</button>
              </div>
              {(profile?.education?.length > 0 && profile.education.some(e => e.degree || e.institution)) ? (
                <div className="space-y-3">
                  {profile.education.map((e, i) => (e.degree || e.institution) && (
                    <div key={i} className="flex gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center shrink-0">
                        <span className="text-sm">🎓</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{e.degree}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{e.institution}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">{e.startDate || 'Jan 2021'} — {e.endDate || 'Dec 2025'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <button onClick={openEducationModal} className="w-full py-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                  Add your education
                </button>
              )}
            </div>

            {/* Certifications */}
            <div className={cardCls}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Certification</h3>
                <button onClick={openCertificationModal} className="text-blue-600 text-lg leading-none hover:text-blue-700">+</button>
              </div>
              {(profile?.certifications?.length > 0 && profile.certifications.some(c => c.title)) ? (
                <div className="space-y-2">
                  {profile.certifications.map((c, i) => c.title && (
                    <div key={i} className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-white">{c.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{c.issuer} • {c.date}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <button onClick={openCertificationModal} className="w-full py-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center gap-2 text-sm text-orange-500 dark:text-orange-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <span className="text-lg">⭐</span>
                  Add Your Certifications!
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Modals */}
      {/* Profile Edit Modal */}
      <Modal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} title="Edit Profile">
        <form onSubmit={handleSaveBasicProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
            <input name="name" value={formData.name} onChange={handleChange} className={inputCls} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Title</label>
            <input name="title" value={formData.title} onChange={handleChange} className={inputCls} placeholder="e.g., Fresher" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Location</label>
            <input name="location" value={formData.location} onChange={handleChange} className={inputCls} placeholder="e.g., Chennai" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} className={inputCls} rows={4} placeholder="Tell us about yourself..." />
            <button type="button" onClick={handleGenerateBio} disabled={generatingBio} className="mt-2 text-xs px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{generatingBio ? 'Generating...' : 'Generate Bio ✨'}</button>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setProfileModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      {/* Bio Modal */}
      <Modal isOpen={bioModalOpen} onClose={() => setBioModalOpen(false)} title="Update Bio">
        <form onSubmit={handleSaveBio} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} className={inputCls} rows={6} placeholder="Tell us about yourself..." required />
            <button type="button" onClick={handleGenerateBio} disabled={generatingBio} className="mt-2 text-xs px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{generatingBio ? 'Generating...' : 'Generate Bio ✨'}</button>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setBioModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      {/* Skills Modal */}
      <Modal isOpen={skillsModalOpen} onClose={() => setSkillsModalOpen(false)} title="Edit Skills">
        <form onSubmit={handleSaveSkills} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Skills (comma separated)</label>
            <input
              type="text"
              value={rawSkillsInput}
              placeholder="MERN, Agentic AI, RAG chatbot"
              onKeyDown={(e) => console.log('Key pressed:', e.key)}
              onChange={(e) => setRawSkillsInput(e.target.value)}
              className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Type freely with commas. Skills will be parsed when you click Save.</p>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setSkillsModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      {/* Experience Modal */}
      <Modal isOpen={experienceModalOpen} onClose={() => setExperienceModalOpen(false)} title="Add Experience">
        <form onSubmit={handleAddExperience} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Role</label>
            <input value={formData.experience[formData.experience.length - 1]?.role || ''} onChange={(e) => updateArray('experience', formData.experience.length - 1, 'role', e.target.value)} className={inputCls} placeholder="Software Engineer" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Company</label>
            <input value={formData.experience[formData.experience.length - 1]?.company || ''} onChange={(e) => updateArray('experience', formData.experience.length - 1, 'company', e.target.value)} className={inputCls} placeholder="Google" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Start Date</label>
              <input value={formData.experience[formData.experience.length - 1]?.startDate || ''} onChange={(e) => updateArray('experience', formData.experience.length - 1, 'startDate', e.target.value)} className={inputCls} placeholder="Jan 2023" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">End Date</label>
              <input value={formData.experience[formData.experience.length - 1]?.endDate || ''} onChange={(e) => updateArray('experience', formData.experience.length - 1, 'endDate', e.target.value)} className={inputCls} placeholder="Present" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
            <textarea value={formData.experience[formData.experience.length - 1]?.description || ''} onChange={(e) => updateArray('experience', formData.experience.length - 1, 'description', e.target.value)} className={inputCls} rows={3} placeholder="What did you do?" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setExperienceModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{saving ? 'Saving...' : 'Add'}</button>
          </div>
        </form>
      </Modal>

      {/* Education Modal */}
      <Modal isOpen={educationModalOpen} onClose={() => setEducationModalOpen(false)} title="Add Education">
        <form onSubmit={handleAddEducation} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Degree</label>
            <input value={formData.education[formData.education.length - 1]?.degree || ''} onChange={(e) => updateArray('education', formData.education.length - 1, 'degree', e.target.value)} className={inputCls} placeholder="B.Tech - ICE" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Institution</label>
            <input value={formData.education[formData.education.length - 1]?.institution || ''} onChange={(e) => updateArray('education', formData.education.length - 1, 'institution', e.target.value)} className={inputCls} placeholder="SKCET" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Start Year</label>
              <input value={formData.education[formData.education.length - 1]?.startDate || ''} onChange={(e) => updateArray('education', formData.education.length - 1, 'startDate', e.target.value)} className={inputCls} placeholder="2021" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">End Year</label>
              <input value={formData.education[formData.education.length - 1]?.endDate || ''} onChange={(e) => updateArray('education', formData.education.length - 1, 'endDate', e.target.value)} className={inputCls} placeholder="2025" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setEducationModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{saving ? 'Saving...' : 'Add'}</button>
          </div>
        </form>
      </Modal>

      {/* Certification Modal */}
      <Modal isOpen={certificationModalOpen} onClose={() => setCertificationModalOpen(false)} title="Add Certification">
        <form onSubmit={handleAddCertification} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Certification Title</label>
            <input value={formData.certifications[formData.certifications.length - 1]?.title || ''} onChange={(e) => updateArray('certifications', formData.certifications.length - 1, 'title', e.target.value)} className={inputCls} placeholder="AWS Certified Developer" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Issuer</label>
            <input value={formData.certifications[formData.certifications.length - 1]?.issuer || ''} onChange={(e) => updateArray('certifications', formData.certifications.length - 1, 'issuer', e.target.value)} className={inputCls} placeholder="Amazon Web Services" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Date</label>
            <input value={formData.certifications[formData.certifications.length - 1]?.date || ''} onChange={(e) => updateArray('certifications', formData.certifications.length - 1, 'date', e.target.value)} className={inputCls} placeholder="Dec 2023" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setCertificationModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{saving ? 'Saving...' : 'Add'}</button>
          </div>
        </form>
      </Modal>

      {/* Header Edit Modal */}
      <Modal isOpen={headerEditModalOpen} onClose={() => setHeaderEditModalOpen(false)} title="Edit Profile Header">
        <form onSubmit={handleSaveHeaderEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Avatar</label>
            <div className="flex items-center gap-4">
              {headerEditForm.avatarPreview && (
                <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center overflow-hidden">
                  <img src={headerEditForm.avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="text-sm text-gray-600 dark:text-gray-400"
                />
                <p className="text-xs text-gray-500 mt-1">Or enter URL:</p>
                <input
                  name="avatar"
                  value={headerEditForm.avatar}
                  onChange={handleHeaderEditChange}
                  className={inputCls}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name *</label>
            <input name="name" value={headerEditForm.name} onChange={handleHeaderEditChange} className={inputCls} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Title</label>
            <input name="title" value={headerEditForm.title} onChange={handleHeaderEditChange} className={inputCls} placeholder="e.g., Fresher, Graduate" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Location *</label>
            <input name="location" value={headerEditForm.location} onChange={handleHeaderEditChange} className={inputCls} placeholder="e.g., Chennai" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
            <input value={profile?.email || ''} className={`${inputCls} bg-gray-100 dark:bg-gray-900 cursor-not-allowed`} disabled />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Career Vision</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">What you're growing into</label>
                <input name="growingInto" value={headerEditForm.growingInto} onChange={handleHeaderEditChange} className={inputCls} placeholder="Entry Level Professional" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">The space you want to grow in</label>
                <input name="role" value={headerEditForm.role} onChange={handleHeaderEditChange} className={inputCls} placeholder="Artificial Intelligence (AI)" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Inspired by</label>
                <input name="inspiredBy" value={headerEditForm.inspiredBy} onChange={handleHeaderEditChange} className={inputCls} placeholder="Shiv Nadar" />
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <button type="button" onClick={() => setHeaderEditModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Profile;
