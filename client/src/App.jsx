import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Rewards from './pages/Rewards'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'

function App() {
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    const token = localStorage.getItem('token');
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Profile />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App
