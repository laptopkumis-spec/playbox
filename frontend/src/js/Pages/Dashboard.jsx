import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import AdminDashboard from './Admin/AdminDashboard';
import CountdownTimer from '../Components/CountdownTimer';
import StatusBadge from '../Components/StatusBadge';

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [cancellingId, setCancellingId] = useState(null); // tracks which booking is being cancelled
    const [stats, setStats] = useState({
        total_bookings: 0,
        active_bookings: 0,
        total_pengeluaran: 0,
        monthly_pengeluaran: 0,
    });

    const fetchBookings = async () => {
        try {
            const res = await api.get('/bookings');
            const data = res.data.data || res.data; // Handle resource wrap

            let total = 0, monthly = 0, activeCount = 0;
            const now = new Date();

            data.forEach(b => {
                const p = b.payment?.data || b.payment;
                if (p?.status === 'paid') {
                    total += parseFloat(p.amount || 0);
                    const created = new Date(b.created_at);
                    if (created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()) {
                        monthly += parseFloat(p.amount || 0);
                    }
                }
                if (b.status === 'active' || b.status === 'scheduled' || b.status === 'pending') activeCount++;
            });

            setStats({
                total_bookings: data.length,
                active_bookings: activeCount,
                total_pengeluaran: total,
                monthly_pengeluaran: monthly,
            });
            setBookings(data);
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!token) { navigate('/login'); return; }
        setUser(storedUser);

        const params = new URLSearchParams(window.location.search);
        if (params.get('booking') === 'success') {
            const method = params.get('method');
            if (method === 'cash') {
                setSuccessMsg('✅ Booking berhasil! Unit Anda sudah AKTIF. Silakan menuju kasir untuk konfirmasi. Selamat bermain!');
            } else {
                setSuccessMsg('✅ Booking berhasil!');
            }
            window.history.replaceState({}, '', '/dashboard');
            setTimeout(() => setSuccessMsg(''), 6000);
        }

        fetchBookings(token);
    }, [navigate]);

    const handleCancel = async (id) => {
        if (!window.confirm('Yakin ingin membatalkan booking ini?')) return;
        setCancellingId(id);
        setErrorMsg('');
        try {
            await api.put(`/bookings/${id}/cancel`);
            setSuccessMsg('Booking berhasil dibatalkan.');
            setTimeout(() => setSuccessMsg(''), 5000);
            fetchBookings();
        } catch (e) {
            const msg = e.response?.data?.message || 'Gagal membatalkan booking.';
            // 429 = rate limited — show as persistent banner, not alert
            if (e.response?.status === 429) {
                setErrorMsg(msg);
            } else {
                setErrorMsg(msg);
                setTimeout(() => setErrorMsg(''), 5000);
            }
        } finally {
            setCancellingId(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus riwayat booking ini?')) return;
        setErrorMsg('');
        try {
            await api.delete(`/bookings/${id}`);
            fetchBookings();
        } catch (e) {
            setErrorMsg(e.response?.data?.message || 'Gagal menghapus riwayat.');
            setTimeout(() => setErrorMsg(''), 5000);
        }
    };

    if (loading) return (
        <div className="py-16 text-center">
            <div className="inline-block w-10 h-10 border-4 border-purple-300 border-t-purple-700 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">Memuat dashboard...</p>
        </div>
    );

    if (user?.role === 'admin') return <AdminDashboard />;

    return (
        <div className="py-6 sm:py-8 animate-in fade-in duration-500 max-w-6xl mx-auto w-full px-4">
            {/* Success Notification Banner */}
            {successMsg && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl text-green-400 font-bold flex items-center justify-between shadow-sm text-sm sm:text-base">
                    <span>{successMsg}</span>
                    <button onClick={() => setSuccessMsg('')} className="text-green-600 hover:text-green-900 ml-4 text-xl">✕</button>
                </div>
            )}

            {/* Error / Rate-limit Banner */}
            {errorMsg && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 font-bold flex items-center justify-between shadow-sm text-sm sm:text-base">
                    <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>{errorMsg}</span>
                    </div>
                    <button onClick={() => setErrorMsg('')} className="text-red-600 hover:text-red-300 ml-4 text-xl shrink-0">✕</button>
                </div>
            )}
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-6">
                <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Dashboard Saya</h2>
                    <p className="text-gray-400 mt-1 text-sm sm:text-base">Selamat datang kembali, <span className="font-bold text-purple-400">{user?.name}</span>!</p>
                </div>
                <button onClick={() => navigate('/booking')} className="w-full sm:w-auto bg-gradient-to-r from-purple-700 to-indigo-600 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    <span>Book Sekarang</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-10">
                <div className="glass-card p-5 sm:p-6 shadow-2xl">
                    <p className="text-xs sm:text-sm font-medium text-gray-400 mb-1">Total Booking</p>
                    <p className="text-3xl sm:text-4xl font-black text-white">{stats.total_bookings}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Semua riwayat</p>
                </div>
                <div className="glass-card p-5 sm:p-6 shadow-2xl border-purple-500/30">
                    <p className="text-xs sm:text-sm font-medium text-gray-400 mb-1">Booking Aktif</p>
                    <p className="text-3xl sm:text-4xl font-black text-purple-400">{stats.active_bookings}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Sedang berjalan</p>
                </div>
                <div className="glass-card p-5 sm:p-6 shadow-2xl border-green-500/30 sm:col-span-2">
                    <p className="text-xs sm:text-sm font-medium text-gray-400 mb-1">Total Pengeluaran</p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-green-400">Rp {stats.total_pengeluaran.toLocaleString('id-ID')}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                        Bulan ini: <span className="font-bold text-green-400">Rp {stats.monthly_pengeluaran.toLocaleString('id-ID')}</span>
                    </p>
                </div>
            </div>

            {/* Booking History Table */}
            <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="text-lg sm:text-xl font-bold text-white">Riwayat Booking</h3>
                <span className="text-[10px] sm:text-sm text-gray-500">{bookings.length} transaksi</span>
            </div>

            <div className="glass-card shadow-2xl overflow-hidden border-white/5">
                {bookings.length === 0 ? (
                    <div className="py-16 sm:py-20 text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        </div>
                        <p className="text-gray-500 font-medium text-sm">Belum ada riwayat booking.</p>
                        <button onClick={() => navigate('/booking')} className="mt-4 bg-purple-700 text-white px-6 py-2 rounded-lg font-bold text-xs sm:text-sm hover:bg-purple-800 transition">Book Sekarang</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="min-w-full divide-y divide-gray-200/5">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-4 sm:px-6 py-4 text-left text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Unit</th>
                                    <th className="px-4 sm:px-6 py-4 text-left text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Jadwal</th>
                                    <th className="px-4 sm:px-6 py-4 text-left text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Sisa Waktu</th>
                                    <th className="px-4 sm:px-6 py-4 text-left text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Pembayaran</th>
                                    <th className="px-4 sm:px-6 py-4 text-left text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-4 sm:px-6 py-4 text-right text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200/5">
                                {bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="font-bold text-white text-xs sm:text-sm">{booking.unit?.data?.name || booking.unit?.name || 'Unit Dihapus'}</div>
                                            <div className="text-[10px] text-gray-500">Rp {parseInt(booking.total_price || 0).toLocaleString('id-ID')}</div>
                                            {booking.total_fines > 0 && (
                                                <div className={`text-[10px] font-bold mt-1 ${booking.fine_status === 'unpaid' ? 'text-red-500' : 'text-green-500'}`}>
                                                    Denda: Rp {parseInt(booking.total_fines).toLocaleString('id-ID')}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs sm:text-sm text-gray-300 font-medium">
                                                {new Date(booking.start_time).toLocaleString('id-ID', { day: 'numeric', month: 'short' })}
                                            </div>
                                            <div className="text-[10px] text-gray-500">
                                                {new Date(booking.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} – {new Date(booking.end_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            {booking.status === 'active' ? (
                                                <CountdownTimer endTime={booking.end_time} variant="active" />
                                            ) : booking.payment?.status === 'pending' && booking.payment?.payment_method === 'qris' ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider">Batas Bayar</span>
                                                    <CountdownTimer endTime={booking.payment.expires_at} variant="payment" />
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-gray-600">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="text-[9px] font-black text-gray-400 uppercase">{booking.payment?.payment_method || '-'}</div>
                                            <div className={`text-[10px] font-bold mt-0.5 ${booking.payment?.status === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                {booking.payment?.status?.toUpperCase() || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={booking.status} />
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-right whitespace-nowrap">
                                            <div className="flex justify-end gap-2">
                                                {['pending', 'scheduled'].includes(booking.status) && (
                                                    <button
                                                        onClick={() => handleCancel(booking.id)}
                                                        disabled={cancellingId === booking.id}
                                                        className="text-[10px] text-red-400 hover:text-red-300 font-bold bg-red-400/10 border border-red-400/20 px-2.5 py-1.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                                    >
                                                        {cancellingId === booking.id ? (
                                                            <>
                                                                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                                </svg>
                                                                Membatalkan...
                                                            </>
                                                        ) : 'Batal'}
                                                    </button>
                                                )}
                                                {['completed', 'cancelled'].includes(booking.status) && (
                                                    <button onClick={() => handleDelete(booking.id)} className="text-[10px] text-gray-400 hover:text-gray-200 font-bold bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg transition">Hapus</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
