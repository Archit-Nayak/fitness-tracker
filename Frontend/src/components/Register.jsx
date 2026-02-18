import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, UserPlus } from 'lucide-react';
import api from '../api/api';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useContext(AuthContext); // We use login to auto-sign in after registration
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Call your backend register route
      const res = await api.post('/auth/register', formData);
      
      // 2. Save the token and user data (just like login)
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // 3. Update the global Auth state
      window.location.href = '/'; // Hard refresh to sync state or use navigate
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <form onSubmit={handleSubmit} className="p-8 bg-white shadow-2xl rounded-3xl w-full max-w-md border border-slate-100">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
            <UserPlus size={32} />
          </div>
        </div>
        
        <h2 className="text-3xl font-extrabold text-center text-slate-800 mb-2">Create Account</h2>
        <p className="text-slate-500 text-center mb-8">Start tracking your fitness journey today.</p>

        <div className="space-y-4">
          <input 
            type="text" placeholder="Full Name" required
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
          />
          <input 
            type="email" placeholder="Email Address" required
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
          />
          <input 
            type="password" placeholder="Password" required
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
          />
        </div>

        <button 
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white w-full py-3 rounded-xl font-bold mt-8 transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : 'Sign Up'}
        </button>

        <p className="text-center mt-6 text-slate-600">
          Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Login</Link>
        </p>
      </form>
    </div>
  );
}