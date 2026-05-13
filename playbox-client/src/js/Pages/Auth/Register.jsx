import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await axios.post('/api/register', { name, email, password });
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
        }
    };

    return (
        <div className="flex justify-center items-center py-16">
            <div className="w-full max-w-md glass-card p-10 shadow-2xl">
                <h2 className="text-4xl font-black text-white text-center mb-8 tracking-tight">Daftar <span className="text-playbox">Playbox</span></h2>
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
                {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm font-medium">{success}</div>}

                <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Nama Lengkap</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 text-white transition-all"
                            placeholder="John Doe" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 text-white transition-all"
                            placeholder="you@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                        <input type="password" required minLength="8" value={password} onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 text-white transition-all"
                            placeholder="••••••••" />
                    </div>
                    <button type="submit" className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all">
                        Sign Up
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-400">
                    Sudah punya akun? <Link to="/login" className="text-purple-400 font-black hover:underline">Login di sini</Link>
                </p>
            </div>
        </div>
    );
}
