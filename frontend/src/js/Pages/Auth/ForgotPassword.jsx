import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../api/axios';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            const response = await api.post('/reset-password', {
                email,
                new_password: newPassword,
                new_password_confirmation: newPasswordConfirm
            });
            console.log(response.data);
            setMessage('Penggantian password berhasil! Mengalihkan ke halaman login...');
            setTimeout(() => {
                navigate('/login', { state: { message: 'Password berhasil diubah, silakan login dengan sandi baru.' } });
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengubah password. Pastikan email terdaftar dan sandi sesuai.');
        }
    };

    return (
        <div className="flex justify-center items-center py-16">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-4">Lupa Sandi</h2>
                <p className="text-sm text-gray-500 text-center mb-6">Masukkan email yang terdaftar dan buat password baru Anda di bawah ini.</p>

                {message && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm font-medium">{message}</div>}
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 transition-colors"
                            placeholder="you@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                        <input type="password" required minLength="8" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 transition-colors"
                            placeholder="Minimal 8 karakter" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                        <input type="password" required minLength="8" value={newPasswordConfirm} onChange={e => setNewPasswordConfirm(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 transition-colors"
                            placeholder="Ketik ulang password baru" />
                    </div>
                    <button type="submit" className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all">
                        Simpan Sandi Baru
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <Link to="/login" className="text-purple-700 font-bold hover:underline">Kembali ke Halaman Login</Link>
                </div>
            </div>
        </div>
    );
}
