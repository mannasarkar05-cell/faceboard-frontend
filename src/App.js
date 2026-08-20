import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Login.css';

// ১. আপনার লাইভ ব্যাকএন্ডের URL এখানে সেট করুন
const API_URL = "https://faceboard-backend-6ert.onrender.com"; // আপনার আসল ব্যাকএন্ড লিঙ্ক এখানে বসাবেন

function App() {
  // Navigation & View States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showProfilePage, setShowProfilePage] = useState(false);
  const [profileTab, setProfileTab] = useState('posts');
  const [aboutSubTab, setAboutSubTab] = useState('overview');

  // Facebook Main Nav Tab State ('home', 'video', 'groups', 'market')
  const [currentNavTab, setCurrentNavTab] = useState('home');

  // Top Right Dropdowns / Popups States
  const [showMenuPopup, setShowMenuPopup] = useState(false);
  const [showMessengerPopup, setShowMessengerPopup] = useState(false);
  const [showNotifPopup, setShowNotifPopup] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Sidebar Sub-View State
  const [sidebarActiveView, setSidebarActiveView] = useState(null);

  // Sidebar "See More / See Less" State
  const [showMoreSidebar, setShowMoreSidebar] = useState(false);

  // Form States
  const [regData, setRegData] = useState({
    firstName: '',
    lastName: '',
    day: '14',
    month: 'Aug',
    year: '2000',
    gender: 'Select your gender',
    email: '',
    password: ''
  });
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [currentUserName, setCurrentUserName] = useState('Chandana');

  // Persistent Media States (localStorage)
  const [profilePic, setProfilePic] = useState(() => 
    localStorage.getItem('fb_profile_pic') || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80'
  );
  const [coverPhoto, setCoverPhoto] = useState(() => 
    localStorage.getItem('fb_cover_photo') || 'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?auto=format&fit=crop&w=1200&q=80'
  );

  // Stories State
  const [stories, setStories] = useState(() => {
    const saved = localStorage.getItem('fb_stories');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      { id: 1, name: 'Wears Zone', bgImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
      { id: 2, name: 'AG Computers', bgImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=300&q=80', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' },
      { id: 3, name: 'Narayan Banerjee', bgImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&q=80', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80' },
      { id: 4, name: 'AYRAA', bgImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=300&q=80', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80' },
      { id: 5, name: 'Gadget Fair', bgImage: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=300&q=80', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80' }
    ];
  });

  // ۲. Posts State: ব্যাকএন্ড থেকে ডেটা লোড করার জন্য ইনিশিয়ালি খালি রাখা হয়েছে
  const [posts, setPosts] = useState([]);

  const [expandedPosts, setExpandedPosts] = useState({});

  // Bio & User Details States
  const [bio, setBio] = useState(() => localStorage.getItem('fb_bio') || 'Add a short bio...');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState('');

  const [userDetails, setUserDetails] = useState(() => {
    const saved = localStorage.getItem('fb_user_details');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      livesIn: 'Feni',
      hometown: 'Feni, Bangladesh',
      work: 'Self-Employed',
      education: 'University/College'
    };
  });
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [tempDetails, setTempDetails] = useState({ ...userDetails });

  // New Post States
  const [newPostText, setNewPostText] = useState('');
  const [newPostMedia, setNewPostMedia] = useState(null);
  const [newMediaType, setNewMediaType] = useState('');
  const [newFeeling, setNewFeeling] = useState('');
  const [showFeelingPicker, setShowFeelingPicker] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});

  const feelingsList = ['😀 Happy', '🥰 Loved', '🥳 Excited', '😎 Cool', '😴 Sleepy', '🔥 Energetic', '☕ Drinking Coffee', '💻 Coding'];

  // Sync with localStorage
  useEffect(() => { localStorage.setItem('fb_profile_pic', profilePic); }, [profilePic]);
  useEffect(() => { localStorage.setItem('fb_cover_photo', coverPhoto); }, [coverPhoto]);
  useEffect(() => { localStorage.setItem('fb_stories', JSON.stringify(stories)); }, [stories]);
  useEffect(() => { localStorage.setItem('fb_bio', bio); }, [bio]);
  useEffect(() => { localStorage.setItem('fb_user_details', JSON.stringify(userDetails)); }, [userDetails]);

  // ۳. ব্যাকএন্ড থেকে পোস্ট ফেচ (Fetch) করার জন্য useEffect
  useEffect(() => {
    fetch(`${API_URL}/api/posts`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPosts(data);
        }
      })
      .catch(err => console.error("Error fetching posts from backend:", err));
  }, []);

  // Handlers
  const handleRegister = (e) => {
    e.preventDefault();
    alert('Account created successfully! Please log in.');
    setIsRegistering(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.email) {
      const namePart = loginData.email.split('@')[0];
      const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      setCurrentUserName(formattedName);
    }
    setIsLoggedIn(true);
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    alert(`Password reset instructions have been sent to ${forgotEmail}`);
    setShowForgotPassword(false);
    setForgotEmail('');
  };

  const handleMediaUpload = (e, callback) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result, file.type.startsWith('video') ? 'video' : 'image');
      reader.readAsDataURL(file);
    }
  };

  // ৪. ব্যাকএন্ডে পোস্ট সাবমিট করার ফাংশন (async/await সহ)
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPostText.trim() && !newPostMedia && !newFeeling) return;

    const newPost = {
      name: currentUserName,
      avatar: profilePic,
      time: 'Just now',
      content: newPostText,
      mediaUrl: newPostMedia,
      mediaType: newMediaType,
      feeling: newFeeling,
      likes: 0,
      isLiked: false,
      comments: []
    };

    try {
      const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPost),
      });

      if (!response.ok) {
        throw new Error('Failed to save post on server');
      }

      const savedPost = await response.json();

      setPosts([savedPost, ...posts]);
      setNewPostText('');
      setNewPostMedia(null);
      setNewMediaType('');
      setNewFeeling('');
      setShowFeelingPicker(false);
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Could not post to server. Please check your backend connection.");
    }
  };

  const handleDeletePost = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`${API_URL}/api/posts/${id}`);
        setPosts(posts.filter(post => post.id !== id && post._id !== id));
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("পোস্ট ডিলিট করা যায়নি। ব্যাকএন্ড কানেকশন চেক করো।");
      }
    }
};

  const handleLike = (id) => {
    setPosts(posts.map(post => {
      const postId = post.id || post._id;
      if (postId === id) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    }));
  };

  const toggleExpandPost = (id) => {
    setExpandedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddComment = (postId, e) => {
    e.preventDefault();
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    setPosts(posts.map(post => {
      const currentId = post.id || post._id;
      if (currentId === postId) {
        return {
          ...post,
          comments: [...post.comments, `${currentUserName}: ${commentText}`]
        };
      }
      return post;
    }));

    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  // --- Helper to close all floating popups ---
  const closeAllPopups = () => {
    setShowMenuPopup(false);
    setShowMessengerPopup(false);
    setShowNotifPopup(false);
    setShowProfileDropdown(false);
  };

  // --- 1. Forgot Password Page ---
  if (showForgotPassword) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.cardBox}>
          <h2 style={styles.cardHeader}>Find Your Account</h2>
          <p style={styles.cardText}>Please enter your email address or mobile number to search for your account.</p>
          <form onSubmit={handleForgotPasswordSubmit}>
            <input 
              type="text" 
              placeholder="Email address or mobile number" 
              value={forgotEmail} 
              onChange={(e) => setForgotEmail(e.target.value)} 
              required 
              style={styles.inputField} 
            />
            <div style={styles.buttonGroup}>
              <button type="button" onClick={() => setShowForgotPassword(false)} style={styles.secondaryBtn}>Cancel</button>
              <button type="submit" style={styles.primaryBtn}>Search</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- 2. Register Page ---
  if (isRegistering) {
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const years = Array.from({ length: 2026 - 1950 + 1 }, (_, i) => 2026 - i);

    return (
      <div style={styles.centerContainer}>
        <div style={{ ...styles.cardBox, maxWidth: '480px' }}>
          <h2 style={{ fontSize: '24px', color: '#1c1e21', margin: 0, fontWeight: 'bold' }}>Create a new account</h2>
          <p style={{ fontSize: '13px', color: '#606770', margin: '4px 0 16px 0' }}>It's quick and easy.</p>
          
          <form onSubmit={handleRegister}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              <input type="text" placeholder="First name" value={regData.firstName} onChange={(e) => setRegData({...regData, firstName: e.target.value})} required style={styles.halfInput} />
              <input type="text" placeholder="Surname" value={regData.lastName} onChange={(e) => setRegData({...regData, lastName: e.target.value})} required style={styles.halfInput} />
            </div>

            <label style={styles.label}>Date of birth</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              <select value={regData.day} onChange={(e) => setRegData({...regData, day: e.target.value})} style={styles.selectField}>
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={regData.month} onChange={(e) => setRegData({...regData, month: e.target.value})} style={styles.selectField}>
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={regData.year} onChange={(e) => setRegData({...regData, year: e.target.value})} style={styles.selectField}>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <label style={styles.label}>Gender</label>
            <select value={regData.gender} onChange={(e) => setRegData({...regData, gender: e.target.value})} style={{ ...styles.inputField, marginBottom: '12px' }}>
              <option>Select your gender</option><option>Female</option><option>Male</option><option>Custom</option>
            </select>

            <label style={styles.label}>Mobile number or email address</label>
            <input type="text" placeholder="Mobile number or email address" value={regData.email} onChange={(e) => setRegData({...regData, email: e.target.value})} required style={{ ...styles.inputField, marginBottom: '12px' }} />

            <label style={styles.label}>New password</label>
            <input type="password" placeholder="New password" value={regData.password} onChange={(e) => setRegData({...regData, password: e.target.value})} required style={{ ...styles.inputField, marginBottom: '12px' }} />

            <button type="submit" style={styles.successBtn}>Sign Up</button>
          </form>

          <button onClick={() => setIsRegistering(false)} style={styles.textBtn}>I already have an account</button>
        </div>
      </div>
    );
  }

  // --- 3. Login Page ---
  if (!isLoggedIn) {
    return (
      <div className="fb-login-container">
        <div className="fb-login-content">
          <div className="fb-left">
            <h1 className="fb-logo">Faceboard</h1>
            <p className="fb-tagline">Faceboard helps you connect and share with the people in your life.</p>
          </div>
          <div className="fb-right">
            <div className="fb-card">
              <form onSubmit={handleLogin}>
                <input type="text" placeholder="Email address or phone number" value={loginData.email} onChange={(e) => setLoginData({...loginData, email: e.target.value})} required />
                <input type="password" placeholder="Password" value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} required />
                <button type="submit" className="login-btn">Log In</button>
              </form>
              <button onClick={() => setShowForgotPassword(true)} style={styles.forgotLink}>Forgotten password?</button>
              <hr className="divider" />
              <button className="create-account-btn" onClick={() => setIsRegistering(true)}>Create new account</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Post Creator UI ---
  const renderPostCreator = () => (
    <div style={styles.postCreatorBox}>
      <div style={styles.postCreatorTopRow}>
        <img src={profilePic} alt="Avatar" style={styles.avatarSmall} />
        
        <div style={styles.inputWithIconsWrapper}>
          <input 
            type="text" 
            placeholder={`What's on your mind, ${currentUserName}?`} 
            value={newPostText} 
            onChange={(e) => setNewPostText(e.target.value)} 
            style={styles.postInputFieldEmbedded}
          />

          <div style={styles.embeddedIconsContainer}>
            <div style={styles.iconCircleBtn} title="Live video">
              <span style={{ fontSize: '18px' }}>📹</span>
            </div>

            <label style={styles.iconCircleBtn} title="Photo/video">
              <span style={{ fontSize: '18px' }}>🖼️</span>
              <input 
                type="file" 
                accept="image/*,video/*" 
                onChange={(e) => handleMediaUpload(e, (url, type) => { setNewPostMedia(url); setNewMediaType(type); })} 
                style={{ display: 'none' }} 
              />
            </label>

            <div onClick={() => setShowFeelingPicker(!showFeelingPicker)} style={styles.iconCircleBtn} title="Feeling/activity">
              <span style={{ fontSize: '18px' }}>😀</span>
            </div>
          </div>
        </div>
      </div>

      {newFeeling && (
        <div style={styles.feelingBadge}>
          feeling {newFeeling}
          <span onClick={() => setNewFeeling('')} style={{ cursor: 'pointer', marginLeft: '4px' }}>✕</span>
        </div>
      )}

      {newPostMedia && (
        <div style={styles.mediaPreviewContainer}>
          {newMediaType === 'video' ? (
            <video src={newPostMedia} controls style={styles.mediaPreview} />
          ) : (
            <img src={newPostMedia} alt="Preview" style={styles.mediaPreview} />
          )}
          <button onClick={() => { setNewPostMedia(null); setNewMediaType(''); }} style={styles.removeMediaBtn}>✕</button>
        </div>
      )}

      {showFeelingPicker && (
        <div style={styles.feelingPickerPopup}>
          <div style={styles.feelingPickerHeader}>
            <strong>Select Feeling</strong>
            <button onClick={() => setShowFeelingPicker(false)} style={styles.closeBtn}>✕</button>
          </div>
          <div style={styles.feelingGrid}>
            {feelingsList.map((item, idx) => (
              <div key={idx} onClick={() => { setNewFeeling(item); setShowFeelingPicker(false); }} style={styles.feelingItem}>
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      {(newPostText.trim() || newPostMedia || newFeeling) && (
        <div style={{ marginTop: '10px', textAlign: 'right' }}>
          <button onClick={handlePostSubmit} style={styles.primaryBtn}>Post</button>
        </div>
      )}
    </div>
  );

  // --- Shared Post Feed Renderer ---
  const renderFeed = () => {
    const CHARACTER_LIMIT = 180;

    return posts.length === 0 ? (
      <div style={styles.noPostsBox}>
        <h3>No posts available</h3>
        <p>Share what you are thinking or upload a new post!</p>
      </div>
    ) : (
      posts.map((post) => {
        const postId = post.id || post._id;
        const isLongText = post.content && post.content.length > CHARACTER_LIMIT;
        const isExpanded = expandedPosts[postId];
        
        let displayContent = post.content;
        if (isLongText && !isExpanded) {
          displayContent = post.content.substring(0, CHARACTER_LIMIT) + '...';
        }

        return (
          <div key={postId} style={styles.postCard}>
            <div style={styles.postHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={post.avatar} alt="Avatar" style={styles.avatarSmall} />
                <div>
                  <strong style={{ color: '#e4e6eb', fontSize: '15px' }}>
                    {post.name} {post.feeling && <span style={{ fontWeight: 'normal', color: '#b0b3b8', fontSize: '13px' }}>is feeling {post.feeling}</span>}
                  </strong>
                  <br />
                  <small style={{ color: '#b0b3b8', fontSize: '12px' }}>{post.time}</small>
                </div>
              </div>
              <button onClick={() => handleDeletePost(postId)} title="Delete Post" style={styles.deleteBtn}>🗑️</button>
            </div>

            {post.content && (
              <div style={styles.postContent}>
                <span>{displayContent}</span>
                {isLongText && (
                  <span onClick={() => toggleExpandPost(postId)} style={styles.seeMoreBtn}>
                    {isExpanded ? ' See less' : ' See more'}
                  </span>
                )}
              </div>
            )}

            {post.mediaUrl && (
              <div style={styles.postMediaWrapper}>
                {post.mediaType === 'video' ? (
                  <video src={post.mediaUrl} controls style={styles.postMedia} />
                ) : (
                  <img src={post.mediaUrl} alt="Post media" style={styles.postMedia} />
                )}
              </div>
            )}
            
            <div style={styles.postStats}>
              <span>👍 {post.likes} Likes</span>
              <span>{post.comments ? post.comments.length : 0} Comments</span>
            </div>

            <div style={styles.postActionButtons}>
              <button onClick={() => handleLike(postId)} style={{ ...styles.actionBtn, color: post.isLiked ? '#2d88ff' : '#b0b3b8' }}>
                {post.isLiked ? '👍 Liked' : '👍 Like'}
              </button>
              <button style={styles.actionBtn}>💬 Comment</button>
              <button style={styles.actionBtn}>↗️ Share</button>
            </div>

            <div style={{ padding: '8px 12px' }}>
              {post.comments && post.comments.map((comment, index) => (
                <div key={index} style={styles.commentBubble}>{comment}</div>
              ))}
              
              <form onSubmit={(e) => handleAddComment(postId, e)} style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <input 
                  type="text" 
                  placeholder="Write a comment..." 
                  value={commentInputs[postId] || ''} 
                  onChange={(e) => setCommentInputs({ ...commentInputs, [postId]: e.target.value })}
                  style={styles.commentInput}
                />
                <button type="submit" style={styles.sendBtn}>Send</button>
              </form>
            </div>
          </div>
        );
      })
    );
  };

  // --- 4. Profile Page View ---
  if (showProfilePage) {
    return (
      <div style={{ backgroundColor: '#18191a', minHeight: '100vh', fontFamily: 'Helvetica, Arial, sans-serif', color: '#e4e6eb' }}>
        <nav style={styles.navbar}>
          <div onClick={() => { setShowProfilePage(false); closeAllPopups(); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={styles.fbLogoCircle}>f</div>
            <input type="text" placeholder="🔍 Search Faceboard" style={styles.navSearch} />
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span onClick={() => { setShowProfilePage(false); setCurrentNavTab('home'); setSidebarActiveView(null); closeAllPopups(); }} style={styles.homeNavBtn}>🏠 Home</span>
            <button onClick={() => setIsLoggedIn(false)} style={styles.logoutBtn}>Log Out</button>
          </div>
        </nav>

        <div style={{ backgroundColor: '#242526', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
          <div style={{ maxWidth: '940px', margin: '0 auto' }}>
            <div style={{ position: 'relative', width: '100%', height: '350px', backgroundColor: '#3a3b3c', overflow: 'hidden' }}>
              <img src={coverPhoto} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <label style={styles.editCoverBtn}>
                📷 Edit Cover Photo
                <input type="file" accept="image/*" onChange={(e) => handleMediaUpload(e, (url) => setCoverPhoto(url))} style={{ display: 'none' }} />
              </label>
            </div>

            <div style={{ padding: '0 30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', marginTop: '-85px', flexWrap: 'wrap' }}>
                  <div style={styles.profileAvatarContainer}>
                    <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <label style={styles.editAvatarBtn}>
                      📷
                      <input type="file" accept="image/*" onChange={(e) => handleMediaUpload(e, (url) => setProfilePic(url))} style={{ display: 'none' }} />
                    </label>
                  </div>
                  <div style={{ paddingBottom: '8px' }}>
                    <h1 style={{ fontSize: '32px', margin: 0, fontWeight: 'bold', color: '#e4e6eb' }}>{currentUserName}</h1>
                    <p style={{ color: '#b0b3b8', margin: '4px 0 0 0', fontSize: '15px' }}>0 friends • 0 followers</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', paddingBottom: '12px' }}>
                  <button style={styles.primaryBtn}>+ Add to story</button>
                  <button onClick={() => setProfileTab('about')} style={styles.secondaryBtnDark}>✏️ Edit profile</button>
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #3a3b3c', margin: '0 30px' }} />

            <div style={{ padding: '0 30px', display: 'flex', gap: '20px', fontWeight: 'bold' }}>
              {['posts', 'about', 'friends', 'photos', 'videos'].map((tab) => (
                <span 
                  key={tab} 
                  onClick={() => setProfileTab(tab)} 
                  style={{ 
                    color: profileTab === tab ? '#2d88ff' : '#b0b3b8', 
                    borderBottom: profileTab === tab ? '3px solid #2d88ff' : '3px solid transparent', 
                    padding: '15px 0', 
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {tab}
                </span>
              ))}
            </div>
          </div>
        </div>

        {profileTab === 'about' ? (
          <div style={styles.aboutContainer}>
            <div style={styles.aboutSidebar}>
              <h3 style={{ padding: '0 16px', margin: '0 0 12px 0', fontSize: '20px', color: '#e4e6eb' }}>About</h3>
              {[['overview', 'Overview'], ['work_edu', 'Work and education'], ['places', 'Places lived'], ['basic_info', 'Basic info']].map(([key, label]) => (
                <div 
                  key={key}
                  onClick={() => setAboutSubTab(key)} 
                  style={{ 
                    padding: '10px 16px', 
                    backgroundColor: aboutSubTab === key ? '#3a3b3c' : 'transparent', 
                    color: aboutSubTab === key ? '#2d88ff' : '#b0b3b8', 
                    fontWeight: 'bold', 
                    borderLeft: aboutSubTab === key ? '4px solid #2d88ff' : '4px solid transparent', 
                    cursor: 'pointer' 
                  }}
                >
                  {label}
                </div>
              ))}
            </div>

            <div style={{ flex: 1, padding: '24px' }}>
              {aboutSubTab === 'overview' && (
                <div>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#e4e6eb' }}>Overview</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={styles.overviewItem}>
                      <div>💼 Works at <b>{userDetails.work || 'Not added'}</b></div>
                      <button onClick={() => setAboutSubTab('work_edu')} style={styles.linkBtn}>Edit</button>
                    </div>
                    <div style={styles.overviewItem}>
                      <div>🎓 Studied at <b>{userDetails.education || 'Not added'}</b></div>
                      <button onClick={() => setAboutSubTab('work_edu')} style={styles.linkBtn}>Edit</button>
                    </div>
                    <div style={styles.overviewItem}>
                      <div>📍 Lives in <b>{userDetails.livesIn || 'Not added'}</b></div>
                      <button onClick={() => setAboutSubTab('places')} style={styles.linkBtn}>Edit</button>
                    </div>
                    <div style={styles.overviewItem}>
                      <div>🏠 From <b>{userDetails.hometown || 'Not added'}</b></div>
                      <button onClick={() => setAboutSubTab('places')} style={styles.linkBtn}>Edit</button>
                    </div>
                  </div>
                </div>
              )}

              {aboutSubTab === 'work_edu' && (
                <div>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#e4e6eb' }}>Work and Education</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={styles.label}>Workplace</label>
                      <input type="text" value={userDetails.work} onChange={(e) => setUserDetails({...userDetails, work: e.target.value})} style={styles.inputFieldDark} />
                    </div>
                    <div>
                      <label style={styles.label}>Education / College</label>
                      <input type="text" value={userDetails.education} onChange={(e) => setUserDetails({...userDetails, education: e.target.value})} style={styles.inputFieldDark} />
                    </div>
                    <button onClick={() => alert('Updated!')} style={styles.primaryBtn}>Save Changes</button>
                  </div>
                </div>
              )}

              {aboutSubTab === 'places' && (
                <div>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#e4e6eb' }}>Places Lived</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={styles.label}>Current City / Lives In</label>
                      <input type="text" value={userDetails.livesIn} onChange={(e) => setUserDetails({...userDetails, livesIn: e.target.value})} style={styles.inputFieldDark} />
                    </div>
                    <div>
                      <label style={styles.label}>Hometown</label>
                      <input type="text" value={userDetails.hometown} onChange={(e) => setUserDetails({...userDetails, hometown: e.target.value})} style={styles.inputFieldDark} />
                    </div>
                    <button onClick={() => alert('Updated!')} style={styles.primaryBtn}>Save Changes</button>
                  </div>
                </div>
              )}

              {aboutSubTab === 'basic_info' && (
                <div>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#e4e6eb' }}>Basic Information</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={styles.infoCard}><span>Username</span><strong>{currentUserName}</strong></div>
                    <div style={styles.infoCard}><span>Gender</span><strong>{regData.gender}</strong></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={styles.profileContentLayout}>
            <div style={{ width: '360px', flex: '1 1 300px' }}>
              <div style={styles.cardBoxSimple}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#e4e6eb' }}>Intro</h3>
                <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '1px solid #3a3b3c', paddingBottom: '16px' }}>
                  {isEditingBio ? (
                    <div>
                      <textarea value={tempBio} onChange={(e) => setTempBio(e.target.value)} style={styles.textareaFieldDark} />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '6px' }}>
                        <button onClick={() => setIsEditingBio(false)} style={styles.secondaryBtn}>Cancel</button>
                        <button onClick={() => { setBio(tempBio || 'Add a short bio...'); setIsEditingBio(false); }} style={styles.primaryBtn}>Save</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p style={{ margin: '0 0 8px 0', cursor: 'pointer', color: '#e4e6eb' }} onClick={() => { setTempBio(bio === 'Add a short bio...' ? '' : bio); setIsEditingBio(true); }}>{bio}</p>
                      <button onClick={() => { setTempBio(bio === 'Add a short bio...' ? '' : bio); setIsEditingBio(true); }} style={styles.fullWidthGrayBtn}>Edit bio</button>
                    </div>
                  )}
                </div>

                <div>
                  {isEditingDetails ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={styles.label}>Lives in:</label>
                      <input type="text" value={tempDetails.livesIn} onChange={(e) => setTempDetails({...tempDetails, livesIn: e.target.value})} style={styles.inputFieldDark} />
                      <label style={styles.label}>Hometown:</label>
                      <input type="text" value={tempDetails.hometown} onChange={(e) => setTempDetails({...tempDetails, hometown: e.target.value})} style={styles.inputFieldDark} />
                      <label style={styles.label}>Work:</label>
                      <input type="text" value={tempDetails.work} onChange={(e) => setTempDetails({...tempDetails, work: e.target.value})} style={styles.inputFieldDark} />
                      <label style={styles.label}>Education:</label>
                      <input type="text" value={tempDetails.education} onChange={(e) => setTempDetails({...tempDetails, education: e.target.value})} style={styles.inputFieldDark} />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '8px' }}>
                        <button onClick={() => setIsEditingDetails(false)} style={styles.secondaryBtn}>Cancel</button>
                        <button onClick={() => { setUserDetails(tempDetails); setIsEditingDetails(false); }} style={styles.primaryBtn}>Save details</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#b0b3b8' }}>
                        <div>📍 Lives in <b>{userDetails.livesIn}</b></div>
                        <div>🏠 Hometown <b>{userDetails.hometown}</b></div>
                        <div>💼 Works at <b>{userDetails.work}</b></div>
                        <div>🎓 Studied at <b>{userDetails.education}</b></div>
                      </div>
                      <button onClick={() => { setTempDetails({...userDetails}); setIsEditingDetails(true); }} style={styles.fullWidthGrayBtn}>Edit details</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ flex: '2 1 400px' }}>
              {renderPostCreator()}
              {renderFeed()}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- 5. Home / Dashboard Page ---
  return (
    <div style={{ backgroundColor: '#18191a', minHeight: '100vh', fontFamily: 'Helvetica, Arial, sans-serif', color: '#e4e6eb' }}>
      {/* Top Navbar */}
      <nav style={styles.navbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px' }}>
          <div style={styles.fbLogoCircle}>f</div>
          <input type="text" placeholder="🔍 Search Faceboard" style={styles.navSearch} />
        </div>

        {/* Center Icons Bar */}
        <div style={styles.centerNavTabs}>
          <div 
            onClick={() => { setCurrentNavTab('home'); setSidebarActiveView(null); closeAllPopups(); }} 
            style={{ ...styles.centerNavTabItem, borderBottom: currentNavTab === 'home' && !sidebarActiveView ? '3px solid #2d88ff' : '3px solid transparent', color: currentNavTab === 'home' && !sidebarActiveView ? '#2d88ff' : '#b0b3b8' }}
            title="Home"
          >
            🏠
          </div>
          <div 
            onClick={() => { setCurrentNavTab('video'); setSidebarActiveView(null); closeAllPopups(); }} 
            style={{ ...styles.centerNavTabItem, borderBottom: currentNavTab === 'video' ? '3px solid #2d88ff' : '3px solid transparent', color: currentNavTab === 'video' ? '#2d88ff' : '#b0b3b8' }}
            title="Video / Watch"
          >
            📺
          </div>
          <div 
            onClick={() => { setCurrentNavTab('groups'); setSidebarActiveView(null); closeAllPopups(); }} 
            style={{ ...styles.centerNavTabItem, borderBottom: currentNavTab === 'groups' ? '3px solid #2d88ff' : '3px solid transparent', color: currentNavTab === 'groups' ? '#2d88ff' : '#b0b3b8' }}
            title="Groups"
          >
            👥
          </div>
          <div 
            onClick={() => { setCurrentNavTab('market'); setSidebarActiveView(null); closeAllPopups(); }} 
            style={{ ...styles.centerNavTabItem, borderBottom: currentNavTab === 'market' ? '3px solid #2d88ff' : '3px solid transparent', color: currentNavTab === 'market' ? '#2d88ff' : '#b0b3b8' }}
            title="Marketplace"
          >
            🛒
          </div>
        </div>

        {/* --- Top Right Corner Icons --- */}
        <div style={styles.topRightIconsContainer}>
          {/* 1. Menu (9-dot grid) */}
          <div 
            style={{ ...styles.topRightIconButton, backgroundColor: showMenuPopup ? '#3a3b3c' : '#4e4f50' }}
            onClick={() => { closeAllPopups(); setShowMenuPopup(!showMenuPopup); }}
            title="Menu"
          >
            <span style={{ fontSize: '18px' }}>☷</span>
          </div>

          {/* 2. Messenger */}
          <div 
            style={{ ...styles.topRightIconButton, backgroundColor: showMessengerPopup ? '#3a3b3c' : '#4e4f50' }}
            onClick={() => { closeAllPopups(); setShowMessengerPopup(!showMessengerPopup); }}
            title="Messenger"
          >
            <span style={{ fontSize: '16px' }}>💬</span>
          </div>

          {/* 3. Notifications */}
          <div 
            style={{ ...styles.topRightIconButton, backgroundColor: showNotifPopup ? '#3a3b3c' : '#4e4f50', position: 'relative' }}
            onClick={() => { closeAllPopups(); setShowNotifPopup(!showNotifPopup); }}
            title="Notifications"
          >
            <span style={{ fontSize: '16px' }}>🔔</span>
            <span style={styles.notifRedDot}></span>
          </div>

          {/* 4. Profile Dropdown (Avatar + Arrow) */}
          <div 
            style={{ ...styles.topRightProfileButton, backgroundColor: showProfileDropdown ? '#3a3b3c' : 'transparent' }}
            onClick={() => { closeAllPopups(); setShowProfileDropdown(!showProfileDropdown); }}
            title="Account"
          >
            <img src={profilePic} alt="Avatar" style={styles.topRightAvatar} />
            <div style={styles.profileArrowBadge}>▼</div>
          </div>
        </div>
      </nav>

      {/* --- Floating Dropdowns & Popups for Top-Right Icons --- */}
      {showMenuPopup && (
        <div style={styles.floatingPopupCard}>
          <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #3a3b3c', paddingBottom: '8px' }}>Menu Shortcuts</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li onClick={() => { setSidebarActiveView('Friends'); setShowMenuPopup(false); }} style={styles.popupMenuItem}>👥 Friends</li>
            <li onClick={() => { setSidebarActiveView('Groups'); setShowMenuPopup(false); }} style={styles.popupMenuItem}>👥 Groups</li>
            <li onClick={() => { setSidebarActiveView('Marketplace'); setShowMenuPopup(false); }} style={styles.popupMenuItem}>🛒 Marketplace</li>
            <li onClick={() => { setSidebarActiveView('Reels'); setShowMenuPopup(false); }} style={styles.popupMenuItem}>🎬 Reels</li>
            <li onClick={() => { setSidebarActiveView('Memories'); setShowMenuPopup(false); }} style={styles.popupMenuItem}>⏰ Memories</li>
          </ul>
        </div>
      )}

      {showMessengerPopup && (
        <div style={styles.floatingPopupCard}>
          <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #3a3b3c', paddingBottom: '8px' }}>Chats (Messenger)</h3>
          <p style={{ color: '#b0b3b8', fontSize: '14px' }}>No active conversations right now.</p>
          <button onClick={() => { setSidebarActiveView('Messenger'); setShowMessengerPopup(false); }} style={styles.primaryBtn}>Open Messenger Page</button>
        </div>
      )}

      {showNotifPopup && (
        <div style={styles.floatingPopupCard}>
          <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #3a3b3c', paddingBottom: '8px' }}>Notifications</h3>
          <p style={{ color: '#b0b3b8', fontSize: '14px' }}>You have no new notifications.</p>
        </div>
      )}

      {showProfileDropdown && (
        <div style={styles.floatingPopupCard}>
          <div onClick={() => { setShowProfilePage(true); closeAllPopups(); }} style={styles.popupProfileHeader}>
            <img src={profilePic} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <strong style={{ fontSize: '15px', color: '#e4e6eb' }}>{currentUserName}</strong>
              <p style={{ fontSize: '12px', color: '#2d88ff', margin: 0 }}>See your profile</p>
            </div>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid #3a3b3c', margin: '8px 0' }} />
          <button onClick={() => setIsLoggedIn(false)} style={styles.popupLogoutBtn}>🚪 Log Out</button>
        </div>
      )}

      {/* Conditional rendering based on Top Header tab clicks */}
      {currentNavTab === 'video' && !sidebarActiveView && (
        <div style={styles.tabContentScreen}>
          <h2>Video Feed / Watch</h2>
          <p style={{ color: '#b0b3b8' }}>Explore trending videos and reels here.</p>
        </div>
      )}

      {currentNavTab === 'groups' && !sidebarActiveView && (
        <div style={styles.tabContentScreen}>
          <h2>Groups</h2>
          <p style={{ color: '#b0b3b8' }}>Connect with communities that share your interests.</p>
        </div>
      )}

      {currentNavTab === 'market' && !sidebarActiveView && (
        <div style={styles.tabContentScreen}>
          <h2>Marketplace</h2>
          <p style={{ color: '#b0b3b8' }}>Buy and sell items in your community.</p>
        </div>
      )}

      {/* Sidebar Sub-views */}
      {sidebarActiveView && (
        <div style={styles.tabContentScreen}>
          <h2>{sidebarActiveView}</h2>
          <p style={{ color: '#b0b3b8', marginBottom: '20px' }}>Here you can view and manage your {sidebarActiveView.toLowerCase()}.</p>
          <button onClick={() => setSidebarActiveView(null)} style={styles.primaryBtn}>Back to Feed</button>
        </div>
      )}

      {currentNavTab === 'home' && !sidebarActiveView && (
        <div style={styles.mainDashboardLayout}>
          {/* Left Sidebar */}
          <div style={styles.sidebar}>
            <ul style={styles.sidebarList}>
              <li onClick={() => setShowProfilePage(true)} style={styles.sidebarItem}>
                <img src={profilePic} alt="Avatar" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} /> 
                {currentUserName}
              </li>
              <li onClick={() => setSidebarActiveView('Friends')} style={styles.sidebarItem}><span style={styles.iconStyle}>👥</span> Friends</li>
              <li onClick={() => setSidebarActiveView('Memories')} style={styles.sidebarItem}><span style={styles.iconStyle}>⏰</span> Memories</li>
              <li onClick={() => setSidebarActiveView('Saved')} style={styles.sidebarItem}><span style={styles.iconStyle}>🔖</span> Saved</li>
              <li onClick={() => setSidebarActiveView('Groups')} style={styles.sidebarItem}><span style={styles.iconStyle}>👥</span> Groups</li>
              <li onClick={() => setSidebarActiveView('Reels')} style={styles.sidebarItem}><span style={styles.iconStyle}>🎬</span> Reels</li>
              <li onClick={() => setSidebarActiveView('Marketplace')} style={styles.sidebarItem}><span style={styles.iconStyle}>🛒</span> Marketplace</li>
              <li onClick={() => setSidebarActiveView('Feeds')} style={styles.sidebarItem}><span style={styles.iconStyle}>📰</span> Feeds</li>

              {showMoreSidebar && (
                <>
                  <li onClick={() => setSidebarActiveView('Events')} style={styles.sidebarItem}><span style={styles.iconStyle}>📅</span> Events</li>
                  <li onClick={() => setSidebarActiveView('Ads Manager')} style={styles.sidebarItem}><span style={styles.iconStyle}>📊</span> Ads Manager</li>
                  <li onClick={() => setSidebarActiveView('Birthdays')} style={styles.sidebarItem}><span style={styles.iconStyle}>🎂</span> Birthdays</li>
                  <li onClick={() => setSidebarActiveView('Gaming Video')} style={styles.sidebarItem}><span style={styles.iconStyle}>🎮</span> Gaming video</li>
                  <li onClick={() => setSidebarActiveView('Messenger')} style={styles.sidebarItem}><span style={styles.iconStyle}>💬</span> Messenger</li>
                  <li onClick={() => setSidebarActiveView('Messenger Kids')} style={styles.sidebarItem}><span style={styles.iconStyle}>🎈</span> Messenger Kids</li>
                  <li onClick={() => setSidebarActiveView('Orders and Payments')} style={styles.sidebarItem}><span style={styles.iconStyle}>💳</span> Orders and payments</li>
                  <li onClick={() => setSidebarActiveView('Pages')} style={styles.sidebarItem}><span style={styles.iconStyle}>🚩</span> Pages</li>
                  <li onClick={() => setSidebarActiveView('Play Games')} style={styles.sidebarItem}><span style={styles.iconStyle}>🕹️</span> Play games</li>
                  <li onClick={() => setSidebarActiveView('Recent Ad Activity')} style={styles.sidebarItem}><span style={styles.iconStyle}>📈</span> Recent ad activity</li>
                </>
              )}

              <li onClick={() => setShowMoreSidebar(!showMoreSidebar)} style={styles.sidebarItem}>
                <span style={styles.seeMoreCircleBtn}>
                  {showMoreSidebar ? '∧' : '∨'}
                </span> 
                {showMoreSidebar ? 'See less' : 'See more'}
              </li>
            </ul>
          </div>

          {/* Main Feed / Timeline with Stories Section */}
          <div style={{ maxWidth: '680px', width: '100%', margin: '0 auto' }}>
            {renderPostCreator()}

            {/* Stories Row */}
            <div style={styles.storiesRow}>
              <label style={styles.createStoryCard(profilePic)}>
                <div style={styles.createStoryPlus}>+</div>
                <span style={styles.createStoryText}>Create story</span>
                <input type="file" accept="image/*" onChange={(e) => handleMediaUpload(e, (url) => {
                  const newStory = { id: Date.now(), name: currentUserName, bgImage: url, avatar: profilePic };
                  setStories([newStory, ...stories]);
                })} style={{ display: 'none' }} />
              </label>

              {stories.map(story => (
                <div key={story.id} style={styles.storyCard(story.bgImage)}>
                  <div style={styles.storyAvatarWrapper}>
                    <img src={story.avatar || profilePic} alt="avatar" style={styles.storyAvatarImg} />
                  </div>
                  <span style={styles.storyTitle}>{story.name}</span>
                </div>
              ))}
            </div>

            {renderFeed()}
          </div>

          {/* Right Sidebar Contacts */}
          <div style={styles.sidebarRight}>
            <h4 style={{ color: '#b0b3b8', marginBottom: '12px' }}>Contacts</h4>
            <ul style={styles.sidebarList}>
              {/* কোনো ডামি কন্টাক্ট নেই */}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline Styles Object
const styles = {
  centerContainer: { padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#18191a', fontFamily: 'Helvetica, Arial, sans-serif' },
  cardBox: { maxWidth: '500px', width: '100%', backgroundColor: '#242526', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)', boxSizing: 'border-box', color: '#e4e6eb' },
  cardBoxSimple: { backgroundColor: '#242526', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.2)', color: '#e4e6eb' },
  cardHeader: { fontSize: '20px', color: '#e4e6eb', borderBottom: '1px solid #3a3b3c', paddingBottom: '12px', margin: '0 0 16px 0' },
  cardText: { fontSize: '15px', color: '#b0b3b8', lineHeight: '1.4', margin: '0 0 16px 0' },
  inputField: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #3a3b3c', fontSize: '16px', boxSizing: 'border-box', outline: 'none', marginBottom: '15px', backgroundColor: '#3a3b3c', color: '#fff' },
  inputFieldDark: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #3a3b3c', backgroundColor: '#3a3b3c', color: '#fff', outline: 'none', boxSizing: 'border-box' },
  halfInput: { width: '50%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #3a3b3c', fontSize: '15px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#3a3b3c', color: '#fff' },
  selectField: { flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #3a3b3c', fontSize: '14px', backgroundColor: '#3a3b3c', color: '#fff' },
  label: { fontSize: '12px', color: '#b0b3b8', fontWeight: 'bold', display: 'block', marginBottom: '4px' },
  buttonGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #3a3b3c', paddingTop: '16px' },
  primaryBtn: { backgroundColor: '#2d88ff', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', padding: '8px 16px', cursor: 'pointer' },
  secondaryBtn: { backgroundColor: '#3a3b3c', color: '#e4e6eb', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', padding: '8px 16px', cursor: 'pointer' },
  secondaryBtnDark: { backgroundColor: '#3a3b3c', color: '#e4e6eb', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' },
  successBtn: { width: '100%', backgroundColor: '#31a24c', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', padding: '10px 0', cursor: 'pointer' },
  textBtn: { width: '100%', backgroundColor: 'transparent', color: '#2d88ff', border: 'none', fontSize: '15px', fontWeight: 'bold', padding: '10px 0', cursor: 'pointer', marginTop: '10px' },
  forgotLink: { background: 'none', border: 'none', color: '#2d88ff', padding: 0, fontSize: '14px', cursor: 'pointer', display: 'block', margin: '14px auto 0 auto', textAlign: 'center' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', height: '56px', backgroundColor: '#242526', boxShadow: '0 1px 2px rgba(0,0,0,0.2)', position: 'sticky', top: 0, zIndex: 1000 },
  fbLogoCircle: { width: '40px', height: '40px', backgroundColor: '#2d88ff', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 'bold', flexShrink: 0 },
  navSearch: { backgroundColor: '#3a3b3c', border: 'none', padding: '10px 16px', borderRadius: '20px', outline: 'none', width: '200px', color: '#fff' },
  centerNavTabs: { display: 'flex', height: '100%', gap: '4px' },
  centerNavTabItem: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '110px', fontSize: '22px', cursor: 'pointer', height: '100%', boxSizing: 'border-box' },
  
  // Top Right Icons & Popups Styles
  topRightIconsContainer: { display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px', justifyContent: 'flex-end' },
  topRightIconButton: { width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#e4e6eb' },
  topRightProfileButton: { display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '20px', cursor: 'pointer' },
  topRightAvatar: { width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' },
  profileArrowBadge: { fontSize: '10px', color: '#e4e6eb' },
  notifRedDot: { position: 'absolute', top: '8px', right: '8px', width: '10px', height: '10px', backgroundColor: '#e41e3f', borderRadius: '50%', border: '2px solid #242526' },
  
  floatingPopupCard: { position: 'absolute', top: '64px', right: '16px', width: '300px', backgroundColor: '#242526', border: '1px solid #3a3b3c', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', padding: '16px', zIndex: 1100, color: '#e4e6eb' },
  popupMenuItem: { padding: '10px', borderRadius: '6px', cursor: 'pointer', backgroundColor: '#3a3b3c', fontWeight: 'bold', fontSize: '14px' },
  popupProfileHeader: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '6px', borderRadius: '6px', backgroundColor: '#3a3b3c' },
  popupLogoutBtn: { width: '100%', backgroundColor: '#3a3b3c', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', color: '#e4e6eb', cursor: 'pointer', textAlign: 'left' },

  homeNavBtn: { cursor: 'pointer', fontWeight: 'bold', padding: '8px 16px', backgroundColor: '#3a3b3c', borderRadius: '20px', fontSize: '14px', color: '#e4e6eb' },
  logoutBtn: { backgroundColor: '#3a3b3c', color: '#e4e6eb', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
  tabContentScreen: { padding: '40px', textAlign: 'center', color: '#e4e6eb', minHeight: 'calc(100vh - 56px)' },
  editCoverBtn: { position: 'absolute', bottom: '15px', right: '15px', backgroundColor: '#242526', color: '#e4e6eb', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.4)', fontSize: '14px' },
  profileAvatarContainer: { position: 'relative', width: '168px', height: '168px', borderRadius: '50%', border: '4px solid #242526', overflow: 'hidden', backgroundColor: '#242526', boxShadow: '0 2px 4px rgba(0,0,0,0.4)' },
  editAvatarBtn: { position: 'absolute', bottom: '8px', right: '8px', backgroundColor: '#3a3b3c', padding: '8px', borderRadius: '50%', cursor: 'pointer', border: '1px solid #4e4f50' },
  aboutContainer: { maxWidth: '940px', margin: '20px auto', backgroundColor: '#242526', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.2)', display: 'flex', minHeight: '450px', overflow: 'hidden', color: '#e4e6eb' },
  aboutSidebar: { width: '280px', borderRight: '1px solid #3a3b3c', padding: '16px 0' },
  overviewItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '15px', color: '#e4e6eb' },
  linkBtn: { background: 'none', border: 'none', color: '#2d88ff', cursor: 'pointer', fontWeight: '600' },
  infoCard: { padding: '12px', backgroundColor: '#3a3b3c', borderRadius: '6px', fontSize: '15px', color: '#e4e6eb' },
  profileContentLayout: { maxWidth: '940px', margin: '20px auto', display: 'flex', gap: '16px', padding: '0 16px', flexWrap: 'wrap' },
  textareaFieldDark: { width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #3a3b3c', backgroundColor: '#3a3b3c', color: '#fff', resize: 'none', outline: 'none', fontSize: '14px', boxSizing: 'border-box', minHeight: '60px' },
  fullWidthGrayBtn: { width: '100%', backgroundColor: '#3a3b3c', border: 'none', padding: '8px 0', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', color: '#e4e6eb', marginTop: '8px' },
  postCreatorBox: { backgroundColor: '#242526', borderRadius: '8px', padding: '12px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.2)', marginBottom: '16px', position: 'relative', color: '#e4e6eb' },
  avatarSmall: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' },
  postCreatorTopRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  inputWithIconsWrapper: { flex: 1, display: 'flex', alignItems: 'center', backgroundColor: '#3a3b3c', borderRadius: '20px', paddingRight: '8px' },
  postInputFieldEmbedded: { flex: 1, backgroundColor: 'transparent', border: 'none', padding: '10px 16px', outline: 'none', fontSize: '15px', color: '#fff', boxSizing: 'border-box' },
  embeddedIconsContainer: { display: 'flex', alignItems: 'center', gap: '4px' },
  iconCircleBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', transition: 'background 0.2s' },
  feelingBadge: { display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#3a3b3c', padding: '4px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', marginTop: '8px', color: '#e4e6eb' },
  mediaPreviewContainer: { position: 'relative', margin: '10px 0', maxHeight: '200px', overflow: 'hidden', borderRadius: '8px', backgroundColor: '#000' },
  mediaPreview: { width: '100%', maxHeight: '200px', objectFit: 'contain' },
  removeMediaBtn: { position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 'bold' },
  feelingPickerPopup: { position: 'absolute', top: '70px', left: '20px', right: '20px', backgroundColor: '#242526', border: '1px solid #3a3b3c', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.4)', padding: '12px', zIndex: 100, color: '#e4e6eb' },
  feelingPickerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #3a3b3c', paddingBottom: '6px' },
  closeBtn: { background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', color: '#e4e6eb' },
  feelingGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' },
  feelingItem: { padding: '8px', borderRadius: '6px', backgroundColor: '#3a3b3c', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#e4e6eb' },
  noPostsBox: { backgroundColor: '#242526', borderRadius: '8px', padding: '40px', textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.2)', color: '#b0b3b8' },
  postCard: { backgroundColor: '#242526', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.2)', marginBottom: '16px', padding: '12px 0', color: '#e4e6eb' },
  postHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 12px 8px 12px' },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#b0b3b8', padding: '4px 8px', borderRadius: '50%' },
  postContent: { padding: '0 12px', color: '#e4e6eb', fontSize: '15px', lineHeight: '1.5', margin: '8px 0', wordBreak: 'break-word' },
  seeMoreBtn: { color: '#2d88ff', cursor: 'pointer', fontWeight: 'bold', marginLeft: '4px' },
  postMediaWrapper: { margin: '8px 0', backgroundColor: '#000', maxHeight: '450px', overflow: 'hidden', display: 'flex', justifyContent: 'center' },
  postMedia: { width: '100%', maxHeight: '450px', objectFit: 'contain' },
  postStats: { display: 'flex', justifyContent: 'space-between', padding: '0 12px 8px 12px', fontSize: '13px', color: '#b0b3b8' },
  postActionButtons: { display: 'flex', justifyContent: 'space-around', borderTop: '1px solid #3a3b3c', borderBottom: '1px solid #3a3b3c', padding: '4px 0' },
  actionBtn: { fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', fontSize: '14px', color: '#b0b3b8' },
  commentBubble: { fontSize: '13.5px', color: '#e4e6eb', backgroundColor: '#3a3b3c', padding: '8px 12px', borderRadius: '18px', marginBottom: '6px', display: 'inline-block', width: '100%', boxSizing: 'border-box' },
  commentInput: { flex: 1, padding: '8px 12px', borderRadius: '20px', border: '1px solid #3a3b3c', outline: 'none', fontSize: '14px', backgroundColor: '#3a3b3c', color: '#fff' },
  sendBtn: { backgroundColor: '#2d88ff', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  mainDashboardLayout: { display: 'flex', justifyContent: 'space-between', padding: '16px' },
  sidebar: { width: '280px', position: 'sticky', top: '70px', height: 'fit-content', overflowY: 'auto', maxHeight: 'calc(100vh - 80px)' },
  sidebarRight: { width: '280px', position: 'sticky', top: '70px', height: 'fit-content' },
  sidebarList: { listStyle: 'none', padding: 0, margin: 0 },
  sidebarItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#e4e6eb' },
  iconStyle: { fontSize: '18px', width: '28px', textAlign: 'center' },
  seeMoreCircleBtn: { width: '28px', height: '28px', backgroundColor: '#3a3b3c', color: '#e4e6eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold' },
  storiesRow: { display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' },
  createStoryCard: (profilePic) => ({ minWidth: '110px', height: '180px', borderRadius: '10px', backgroundColor: '#242526', backgroundImage: `url(${profilePic})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.2)', flexShrink: 0, display: 'block' }),
  createStoryPlus: { position: 'absolute', bottom: '28px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#2d88ff', color: '#fff', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', border: '3px solid #242526' },
  createStoryText: { position: 'absolute', bottom: '8px', width: '100%', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', color: '#fff' },
  storyCard: (bgImage) => ({ minWidth: '110px', height: '180px', borderRadius: '10px', backgroundColor: '#3a3b3c', backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', cursor: 'pointer', padding: '8px', boxSizing: 'border-box', flexShrink: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }),
  storyAvatarWrapper: { width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #2d88ff', overflow: 'hidden', backgroundColor: '#fff' },
  storyAvatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  storyTitle: { position: 'absolute', bottom: '8px', left: '8px', right: '8px', fontSize: '12px', fontWeight: 'bold', color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
};

export default App;