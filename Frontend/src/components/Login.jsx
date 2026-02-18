import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      alert("Welcome back!");
    } catch (err) {
      alert("Login failed: Check your credentials");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="p-8 bg-white shadow-xl rounded-2xl w-96">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <input 
          type="email" placeholder="Email" className="w-full mb-3 p-2 border rounded"
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" placeholder="Password" className="w-full mb-4 p-2 border rounded"
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button className="bg-indigo-600 text-white w-full py-2 rounded">Sign In</button>
      </form>
    </div>
  );
}