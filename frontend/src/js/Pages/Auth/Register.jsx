import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import PasswordInput from '../../Components/PasswordInput';

export default function Register() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        // Clear field-level error on change
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateClient = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = 'Nama lengkap wajib diisi.';
        if (!form.email.trim()) newErrors.email = 'Email wajib diisi.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Format email tidak valid.';
        if (!form.password) newErrors.password = 'Password wajib diisi.';
        else if (form.password.length < 8) newErrors.password = 'Password minimal 8 karakter.';
        if (!form.password_confirmation) newErrors.password_confirmation = 'Konfirmasi password wajib diisi.';
        else if (form.password !== form.password_confirmation) newErrors.password_confirmation = 'Password dan konfirmasi tidak cocok.';
        return newErrors;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setErrors({});
        setSuccess('');

        // Client-side validation first
        const clientErrors = validateClient();
        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/register', {
                name: form.name,
                email: form.email,
                password: form.password,
            });

            // Save token & user immediately — no need to login again
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            setSuccess('Registrasi berhasil! Mengalihkan ke dashboard...');
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } catch (err) {
            const data = err.response?.data;
            if (err.response?.status === 422) {
                // Backend may return field-level errors (object) or a single message (string)
                if (data?.errors && typeof data.errors === 'object') {
                    // Normalize: backend may return string[] or string per field
                    const normalized = {};
                    Object.entries(data.errors).forEach(([key, val]) => {
                        normalized[key] = Array.isArray(val) ? val[0] : val;
                    });
                    setErrors(normalized);
                }
                setError(data?.message || 'Registrasi gagal. Periksa kembali inputan Anda.');
            } else {
                const detailedError = data?.error
                    ? `${data.message}: ${data.error}`
                    : (data?.message || 'Registrasi gagal. Silakan coba lagi.');
                setError(detailedError);
            }
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (field) =>
        `w-full px-4 py-3.5 bg-white/5 border ${
            errors[field] ? 'border-red-500/60' : 'border-white/10'
        } rounded-xl focus:ring-2 focus:ring-purple-500 text-white transition-all outline-none placeholder-gray-600`;

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-80px)] py-8 px-4 sm:py-16">
            <div className="w-full max-w-md glass-card p-6 sm:p-10 shadow-2xl">
                <h2 className="text-3xl sm:text-4xl font-black text-white text-center mb-2 tracking-tight">
                    Daftar <span className="text-playbox">Playbox</span>
                </h2>
                <p className="text-center text-gray-500 text-sm mb-8">Buat akun baru untuk mulai booking</p>

                {/* Global error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {/* Success */}
                {success && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {success}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-5" noValidate>
                    {/* Nama Lengkap */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-400 mb-2 px-1">Nama Lengkap</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className={inputClass('name')}
                            placeholder="Nama Anda"
                            autoComplete="name"
                            disabled={loading}
                        />
                        {errors.name && <p className="text-red-400 text-xs mt-1.5 px-1">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-400 mb-2 px-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className={inputClass('email')}
                            placeholder="email@example.com"
                            autoComplete="email"
                            disabled={loading}
                        />
                        {errors.email && <p className="text-red-400 text-xs mt-1.5 px-1">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-400 mb-2 px-1">Password</label>
                        <PasswordInput
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Min. 8 karakter"
                            autoComplete="new-password"
                            disabled={loading}
                            error={!!errors.password}
                        />
                        {/* Password strength hint */}
                        {form.password && (
                            <div className="mt-2 px-1">
                                <div className="flex gap-1 mb-1">
                                    {[1, 2, 3, 4].map(i => (
                                        <div
                                            key={i}
                                            className={`h-1 flex-1 rounded-full transition-all ${
                                                getPasswordStrength(form.password) >= i
                                                    ? strengthColor(getPasswordStrength(form.password))
                                                    : 'bg-white/10'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <p className={`text-xs ${strengthTextColor(getPasswordStrength(form.password))}`}>
                                    {strengthLabel(getPasswordStrength(form.password))}
                                </p>
                            </div>
                        )}
                        {errors.password && <p className="text-red-400 text-xs mt-1.5 px-1">{errors.password}</p>}
                    </div>

                    {/* Konfirmasi Password */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-400 mb-2 px-1">Konfirmasi Password</label>
                        <PasswordInput
                            name="password_confirmation"
                            value={form.password_confirmation}
                            onChange={handleChange}
                            placeholder="Ulangi password"
                            autoComplete="new-password"
                            disabled={loading}
                            error={!!errors.password_confirmation}
                        />
                        {/* Match indicator */}
                        {form.password_confirmation && form.password && (
                            <p className={`text-xs mt-1.5 px-1 flex items-center gap-1 ${
                                form.password === form.password_confirmation ? 'text-green-400' : 'text-red-400'
                            }`}>
                                {form.password === form.password_confirmation ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Password cocok
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        Password tidak cocok
                                    </>
                                )}
                            </p>
                        )}
                        {errors.password_confirmation && (
                            <p className="text-red-400 text-xs mt-1.5 px-1">{errors.password_confirmation}</p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-purple-900/20 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Mendaftarkan...
                            </>
                        ) : (
                            'Daftar Sekarang'
                        )}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-400">
                    Sudah punya akun?{' '}
                    <Link to="/login" className="text-purple-400 font-bold hover:text-purple-300 transition-colors">
                        Login di sini
                    </Link>
                </p>
            </div>
        </div>
    );
}

// --- Password strength helpers ---
function getPasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return Math.min(score, 4);
}

function strengthColor(score) {
    return ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'][score - 1] || 'bg-white/10';
}

function strengthTextColor(score) {
    return ['text-red-400', 'text-orange-400', 'text-yellow-400', 'text-green-400'][score - 1] || 'text-gray-500';
}

function strengthLabel(score) {
    return ['Sangat Lemah', 'Lemah', 'Cukup', 'Kuat'][score - 1] || '';
}
