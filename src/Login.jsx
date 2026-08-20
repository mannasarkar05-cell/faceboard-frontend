import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await axios.post('https://faceboard-backend-6ert.onrender.com/api/auth/register', { email, password });
        alert('Registration Successful! Please login now.');
        setIsRegister(false);
      } else {
        const res = await axios.post('https://faceboard-backend-6ert.onrender.com/api/auth/login', { email, password });
        alert('Login Successful!');
        // লগইন সফল হলে মেইন পেজে পাঠিয়ে দেবে
        if (onLoginSuccess) {
          onLoginSuccess(res.data);
        }
      }
    } catch (err) {
      alert('Something went wrong! Please check your email or password.');
      console.log(err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isRegister ? 'FaceBoard Register' : 'FaceBoard Login'}</h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button type="submit">{isRegister ? 'Sign Up' : 'Log In'}</button>
        </form>
        <p onClick={() => setIsRegister(!isRegister)} className="switch-text">
          {isRegister ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
        </p>
      </div>
    </div>
  );
}