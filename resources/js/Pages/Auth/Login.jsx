import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

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
            const response = await axios.post('/api/login', { email, password });
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            window.location.href = '/dashboard';
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="flex justify-center items-center py-16">
            <div className="w-full max-w-md glass-card p-10 shadow-2xl">
                <h2 className="text-4xl font-black text-white text-center mb-8 tracking-tight">Login <span className="text-playbox">Playbox</span></h2>
                {successMsg && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm font-medium">{successMsg}</div>}
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 text-white transition-all"
                            placeholder="you@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                        <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 text-white transition-all"
                            placeholder="••••••••" />
                    </div>
                    <button type="submit" className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all">
                        Sign In
                    </button>
                </form>

                <div className="mt-8 flex flex-col items-center justify-center space-y-4 text-sm">
                    <Link to="/forgot-password" className="text-purple-400 hover:text-purple-300 font-medium">Lupa Sandi?</Link>
                    <p className="text-gray-400">
                        Don't have an account? <Link to="/register" className="text-purple-400 font-black hover:underline">Register here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
