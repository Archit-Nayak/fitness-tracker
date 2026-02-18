import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext'; // 1. Import the provider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Wrap App so every component can access login/logout functions */}
    <AuthProvider> 
      <App />
    </AuthProvider>
  </React.StrictMode>
);