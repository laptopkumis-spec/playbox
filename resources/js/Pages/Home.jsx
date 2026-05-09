import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
    const navigate = useNavigate();
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [loadingSchedule, setLoadingSchedule] = useState(false);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.role === 'admin') {
            navigate('/dashboard');
            return;
        }

        // Fetch Units
        axios.get('/api/units')
            .then(res => {
                setUnits(res.data.data || res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [navigate]);

    const handleViewSchedule = async (unit) => {
        setSelectedUnit(unit);
        setLoadingSchedule(true);
        try {
            const res = await axios.get(`/api/units/${unit.id}/schedule`);
            setSchedule(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingSchedule(false);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-16 animate-in fade-in duration-700 pt-10 pb-20">
            {/* Hero Section */}
            <div className="text-center space-y-6 max-w-4xl px-4">
                <motion.h1 
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    className="text-5xl md:text-7xl font-black tracking-tight text-white leading-tight"
                >
                    Sewa PlayStation <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
                        Tanpa Ribet, Main Puas!
                    </span>
                </motion.h1>
                <motion.p 
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ delay: 0.1 }}
                    className="text-xl text-gray-400 max-w-2xl mx-auto"
                >
                    Booking online sekarang. Cek ketersediaan real-time tiap unit dan tentukan jadwal mabar kamu dengan mudah.
                </motion.p>
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    transition={{ delay: 0.2 }}
                    className="pt-6"
                >
                    <Link to="/booking" className="inline-flex items-center justify-center px-10 py-4 text-lg font-black rounded-2xl text-white bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 shadow-2xl hover:shadow-purple-500/40 transition-all transform hover:-translate-y-1">
                        GAS BOOKING SEKARANG
                    </Link>
                </motion.div>
            </div>

            {/* Units Grid */}
            <div className="w-full max-w-7xl px-4">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-white">Unit Tersedia</h2>
                        <p className="text-gray-500">Pilih mesin tempurmu hari ini</p>
                    </div>
                    <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent mx-10 mb-4"></div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {units.map((unit) => (
                            <motion.div 
                                key={unit.id}
                                whileHover={{ y: -10 }}
                                className="glass-card group overflow-hidden cursor-pointer"
                                onClick={() => handleViewSchedule(unit)}
                            >
                                <div className="relative h-56 overflow-hidden">
                                    <img 
                                        src={unit.name.toLowerCase().includes('ps5') ? '/ps5_unit_hero_1777456580965.png' : '/ps4_rental_unit_1777456379672.png'} 
                                        alt={unit.name} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                    <div className="absolute bottom-4 left-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${unit.status === 'available' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {unit.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">{unit.name}</h3>
                                    <p className="text-purple-400 font-black text-xl mt-1">Rp {unit.hourly_rate.toLocaleString()}<span className="text-xs text-gray-500 font-normal">/jam</span></p>
                                    <p className="text-gray-400 text-sm mt-3 line-clamp-2">{unit.description || 'Kualitas terjamin, stik responsif, dan koleksi game lengkap.'}</p>
                                    <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Klik untuk jadwal</span>
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Schedule Modal */}
            <AnimatePresence>
                {selectedUnit && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setSelectedUnit(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="glass-card w-full max-w-2xl overflow-hidden shadow-2xl border-purple-500/30"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 md:p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-2xl font-black text-white">Jadwal {selectedUnit.name}</h3>
                                        <p className="text-gray-400">Daftar booking yang sudah terkonfirmasi</p>
                                    </div>
                                    <button onClick={() => setSelectedUnit(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" /></svg>
                                    </button>
                                </div>

                                <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10">
                                    <div className="max-h-[400px] overflow-y-auto">
                                        {loadingSchedule ? (
                                            <div className="p-20 text-center">
                                                <div className="inline-block w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                                                <p className="mt-4 text-sm text-gray-500">Mencari jadwal...</p>
                                            </div>
                                        ) : schedule.length === 0 ? (
                                            <div className="p-20 text-center">
                                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                                <p className="text-white font-bold">Unit Bebas Booking!</p>
                                                <p className="text-gray-500 text-sm mt-1">Belum ada jadwal untuk hari ini dan kedepannya.</p>
                                            </div>
                                        ) : (
                                            <table className="min-w-full divide-y divide-white/5">
                                                <thead className="bg-white/5">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Hari/Tanggal</th>
                                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Waktu</th>
                                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {schedule.map((b, i) => (
                                                        <tr key={i} className="hover:bg-white/5">
                                                            <td className="px-6 py-4 text-sm text-white font-medium">
                                                                {new Date(b.start_time).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                                {new Date(b.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {new Date(b.end_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <span className={`px-2 py-1 text-[10px] font-black rounded uppercase ${b.status === 'active' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                                                    {b.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <Link 
                                        to="/booking" 
                                        onClick={() => setSelectedUnit(null)}
                                        className="w-full flex items-center justify-center py-4 bg-purple-700 hover:bg-purple-800 text-white font-black rounded-xl transition-all shadow-xl"
                                    >
                                        BOOK UNIT INI SEKARANG
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
