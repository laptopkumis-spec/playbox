import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import PasswordInput from '../../Components/PasswordInput';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword.length < 8) {
            setError('Password baru minimal 8 karakter.');
            return;
        }
        if (newPassword !== newPasswordConfirm) {
            setError('Konfirmasi password tidak cocok.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/reset-password', {
                email,
                new_password: newPassword,
                new_password_confirmation: newPasswordConfirm,
            });
            setMessage('Password berhasil diubah! Mengalihkan ke halaman login...');
            setTimeout(() => {
                navigate('/login', { state: { message: 'Password berhasil diubah, silakan login dengan sandi baru.' } });
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengubah password. Pastikan email terdaftar.');
        } finally {
            setLoading(false);
        }
    };

    const passwordsMatch = newPasswordConfirm && newPassword === newPasswordConfirm;
    const passwordsMismatch = newPasswordConfirm && newPassword !== newPasswordConfirm;

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-80px)] py-8 px-4 sm:py-16">
            <div className="w-full max-w-md glass-card p-6 sm:p-10 shadow-2xl">
                <h2 className="text-3xl sm:text-4xl font-black text-white text-center mb-2 tracking-tight">
                    Lupa <span className="text-playbox">Sandi</span>
                </h2>
                <p className="text-center text-gray-500 text-sm mb-8">
                    Masukkan email terdaftar dan buat password baru Anda.
                </p>

                {message && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {message}
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    {/* Email */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-400 mb-2 px-1">Email Terdaftar</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 text-white transition-all outline-none placeholder-gray-600"
                            placeholder="you@example.com"
                            autoComplete="email"
                            disabled={loading}
                        />
                    </div>

                    {/* Password Baru */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-400 mb-2 px-1">Password Baru</label>
                        <PasswordInput
                            name="new_password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="Minimal 8 karakter"
                            autoComplete="new-password"
                            disabled={loading}
                        />
                        <p className="text-gray-600 text-xs mt-1.5 px-1">Minimal 8 karakter</p>
                    </div>

                    {/* Konfirmasi Password Baru */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-400 mb-2 px-1">Konfirmasi Password Baru</label>
                        <PasswordInput
                            name="new_password_confirmation"
                            value={newPasswordConfirm}
                            onChange={e => setNewPasswordConfirm(e.target.value)}
                            placeholder="Ketik ulang password baru"
                            autoComplete="new-password"
                            disabled={loading}
                            error={passwordsMismatch}
                        />
                        {/* Match indicator */}
                        {newPasswordConfirm && (
                            <p className={`text-xs mt-1.5 px-1 flex items-center gap-1 ${passwordsMatch ? 'text-green-400' : 'text-red-400'}`}>
                                {passwordsMatch ? (
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
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-purple-900/20 transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Menyimpan...
                            </>
                        ) : 'Simpan Sandi Baru'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm">
                    <Link to="/login" className="text-purple-400 font-bold hover:text-purple-300 transition-colors">
                        ← Kembali ke Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
