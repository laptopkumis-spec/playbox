import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../api/axios';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setErrors({});
        setSuccess('');
        try {
            await api.post('/register', { name, email, password });
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            const data = err.response?.data;
            if (err.response?.status === 422) {
                setErrors(data?.errors || {});
                setError(data?.message || 'Registration failed. Please check your inputs.');
            } else {
                const detailedError = data?.error ? `${data.message}: ${data.error}` : (data?.message || 'Registration failed. Please check your inputs.');
                setError(detailedError);
            }
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-80px)] py-8 px-4 sm:py-16">
            <div className="w-full max-w-md glass-card p-6 sm:p-10 shadow-2xl">
                <h2 className="text-3xl sm:text-4xl font-black text-white text-center mb-8 tracking-tight">Daftar <span className="text-playbox">Playbox</span></h2>

                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </div>}

                {success && <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {success}
                </div>}

                <form onSubmit={handleRegister} className="space-y-5">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-400 mb-2 px-1">Nama Lengkap</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)}
                            className={`w-full px-4 py-3.5 bg-white/5 border ${errors.name ? 'border-red-500/50' : 'border-white/10'} rounded-xl focus:ring-2 focus:ring-purple-500 text-white transition-all outline-none`}
                            placeholder="Nama Anda" />
                        {errors.name && <p className="text-red-400 text-xs mt-1.5 px-1">{errors.name[0]}</p>}
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-400 mb-2 px-1">Email</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                            className={`w-full px-4 py-3.5 bg-white/5 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-xl focus:ring-2 focus:ring-purple-500 text-white transition-all outline-none`}
                            placeholder="email@example.com" />
                        {errors.email && <p className="text-red-400 text-xs mt-1.5 px-1">{errors.email[0]}</p>}
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-400 mb-2 px-1">Password</label>
                        <input type="password" required minLength="8" value={password} onChange={e => setPassword(e.target.value)}
                            className={`w-full px-4 py-3.5 bg-white/5 border ${errors.password ? 'border-red-500/50' : 'border-white/10'} rounded-xl focus:ring-2 focus:ring-purple-500 text-white transition-all outline-none`}
                            placeholder="••••••••" />
                        {errors.password && <p className="text-red-400 text-xs mt-1.5 px-1">{errors.password[0]}</p>}
                    </div>

                    <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-purple-900/20 transition-all active:scale-[0.98] mt-4">
                        Daftar
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-400">
                    Sudah punya akun? <Link to="/login" className="text-purple-400 font-bold hover:text-purple-300 transition-colors">Login di sini</Link>
                </p>
            </div>
        </div>
    );
}
