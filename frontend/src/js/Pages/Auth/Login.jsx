import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../../api/axios';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const [successMsg, setSuccessMsg] = useState(location.state?.message || '');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/login', { email, password });
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            window.location.href = '/';
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-80px)] py-8 px-4 sm:py-16">
            <div className="w-full max-w-md glass-card p-6 sm:p-10 shadow-2xl transition-all duration-300">
                <h2 className="text-3xl sm:text-4xl font-black text-white text-center mb-8 tracking-tight">Login <span className="text-playbox">Playbox</span></h2>

                {successMsg && <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {successMsg}
                </div>}

                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </div>}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-400 mb-2 px-1">Email</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 text-white transition-all outline-none"
                            placeholder="you@example.com" />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-400 mb-2 px-1">Password</label>
                        <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 text-white transition-all outline-none"
                            placeholder="••••••••" />
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-purple-900/20 transition-all active:scale-[0.98] mt-2">
                        Sign In
                    </button>
                </form>

                <div className="mt-8 flex flex-col items-center justify-center space-y-4 text-sm">
                    <Link to="/forgot-password" title="Reset your password" id="forgot-password-link" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Lupa Sandi?</Link>
                    <p className="text-gray-400">
                        Belum punya akun? <Link to="/register" title="Create an account" id="register-link" className="text-purple-400 font-bold hover:text-purple-300 transition-colors">Daftar di sini</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
