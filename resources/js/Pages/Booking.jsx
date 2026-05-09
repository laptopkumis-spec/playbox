import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function Booking() {
    const navigate = useNavigate();
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    // Wizard states
    const [step, setStep] = useState(1);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [schedule, setSchedule] = useState({ 
        date: new Date().toISOString().split('T')[0], 
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':'), 
        duration: 1 
    });
    const [customer, setCustomer] = useState({ name: '', phone: '', email: '', address: '' });
    const [paymentMethod, setPaymentMethod] = useState('qris');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if (storedUser && storedUser.role === 'admin') {
            navigate('/dashboard');
            return;
        }

        if (!token) {
            navigate('/login', { state: { message: 'Silakan login terlebih dahulu untuk melakukan booking.' } });
            return;
        }

        setUser(storedUser);
        setCustomer(prev => ({ ...prev, name: storedUser.name, email: storedUser.email }));

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

    const handleNext = () => {
        if (step === 2) {
            // Validate time
            const now = new Date();
            const selected = new Date(`${schedule.date}T${schedule.time}`);
            if (selected < now) {
                alert("Waktu mulai tidak boleh di masa lalu.");
                return;
            }
        }
        setStep(s => s + 1);
    };
    
    const handlePrev = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            
            // Construct date object carefully to avoid timezone issues
            const [year, month, day] = schedule.date.split('-').map(Number);
            const [hour, minute] = schedule.time.split(':').map(Number);
            
            const startDateObj = new Date(year, month - 1, day, hour, minute, 0);
            const endDateObj = new Date(startDateObj.getTime() + schedule.duration * 60 * 60 * 1000);

            // Manual format to YYYY-MM-DD HH:mm:ss to be absolute
            const pad = (n) => n < 10 ? '0' + n : n;
            const formatForDB = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

            const payload = {
                unit_id: selectedUnit.id,
                start_time: formatForDB(startDateObj),
                end_time: formatForDB(endDateObj),
                payment_method: paymentMethod
            };

            const res = await axios.post('/api/bookings', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (paymentMethod === 'cash') {
                window.location.href = '/dashboard?booking=success&method=cash';
            } else {
                // Booking resource might be wrapped in 'data' even inside JSON response if using new Resource()
                const bookingData = res.data.booking.data || res.data.booking;
                const checkoutUrl = bookingData.payment?.checkout_url;
                if (checkoutUrl) {
                    window.location.href = checkoutUrl;
                } else {
                    alert(res.data.message || 'Booking berhasil! Selesaikan pembayaran QRIS Anda.');
                    window.location.href = '/dashboard';
                }
            }
        } catch (err) {
            alert(err.response?.data?.error || err.response?.data?.message || 'Gagal melakukan booking. Pastikan waktu valid.');
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-16 text-center">
                 <div className="inline-block w-10 h-10 border-4 border-purple-300 border-t-purple-700 rounded-full animate-spin"></div>
                 <p className="mt-4 text-gray-400">Menyiapkan unit...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 w-full px-4">
            <h2 className="text-4xl font-black text-white mb-8 text-center tracking-tight">Booking <span className="text-playbox">PlayStation</span></h2>

            {/* Stepper Indicator */}
            <div className="flex justify-center mb-10 overflow-x-auto py-2">
                <div className="flex space-x-4 items-center">
                    {[1, 2, 3, 4].map(num => (
                        <div key={num} className="flex items-center">
                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-white transition-all duration-300 shadow-xl ${step >= num ? 'bg-purple-600 scale-110' : 'bg-white/10'}`}>
                                {num}
                            </div>
                            {num < 4 && <div className={`w-8 md:w-12 h-1 transition-colors duration-300 ${step > num ? 'bg-purple-600' : 'bg-white/10'}`}></div>}
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-card p-6 md:p-10 shadow-2xl relative overflow-hidden min-h-[450px]">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.3 }}>
                            <h3 className="text-2xl font-bold mb-6 text-white">1. Pilih Unit PlayStation</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {units.map(unit => {
                                    const isAvailable = unit.status === 'available';
                                    const isSelected = selectedUnit?.id === unit.id;
                                    return (
                                        <div key={unit.id} onClick={() => isAvailable && setSelectedUnit(unit)}
                                            className={`p-6 rounded-2xl border-2 transition-all relative overflow-hidden ${!isAvailable ? 'border-white/5 bg-white/5 opacity-40 cursor-not-allowed' :
                                                    isSelected ? 'border-purple-500 shadow-purple-500/20 shadow-2xl bg-purple-500/10' :
                                                        'border-white/10 hover:border-purple-400 cursor-pointer hover:shadow-lg hover:bg-white/5'
                                                }`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-xl font-bold text-white">{unit.name}</h4>
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${isAvailable ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {unit.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-purple-400 font-black mb-4">Rp {unit.hourly_rate.toLocaleString()}/jam</p>
                                            <p className="text-sm text-gray-400">{unit.description || 'Kondisi prima, siap dimainkan kapan saja.'}</p>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-8 flex justify-end">
                                <button disabled={!selectedUnit} onClick={handleNext} className="bg-purple-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                                    Lanjut
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.3 }}>
                            <h3 className="text-2xl font-bold mb-6 text-white">2. Pilih Jadwal & Durasi</h3>
                            <div className="space-y-6 max-w-lg mx-auto">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Pilih Tanggal</label>
                                    <input type="date" required value={schedule.date} onChange={e => setSchedule({ ...schedule, date: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 text-white" min={new Date().toISOString().split('T')[0]} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Jam Mulai</label>
                                    <input type="time" required value={schedule.time} onChange={e => setSchedule({ ...schedule, time: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 text-white" />
                                    <p className="text-xs text-gray-500 mt-1">Gunakan format 24 jam (contoh: 14:00)</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Durasi (Jam)</label>
                                    <div className="flex items-center space-x-4">
                                        <input type="range" min="1" max="24" value={schedule.duration} onChange={e => setSchedule({ ...schedule, duration: parseInt(e.target.value) })} className="w-full accent-purple-500" />
                                        <span className="text-2xl font-black text-purple-400 w-20">{schedule.duration} Jam</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-10 flex justify-between">
                                <button onClick={handlePrev} className="text-gray-400 font-bold px-6 py-3 hover:bg-white/5 rounded-xl transition">Kembali</button>
                                <button disabled={!schedule.date || !schedule.time} onClick={handleNext} className="bg-purple-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-800 transition disabled:opacity-50 shadow-lg">
                                    Lanjut
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.3 }}>
                            <h3 className="text-2xl font-bold mb-6 text-white">3. Data Pemesan</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Nama Lengkap</label>
                                    <input type="text" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Email</label>
                                    <input type="email" value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">No. HP / WhatsApp</label>
                                    <input type="tel" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 text-white" placeholder="08xxxxxxxxxx" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Alamat Lengkap</label>
                                    <textarea value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 text-white" rows="3" placeholder="Opsional untuk play-in di tempat..."></textarea>
                                </div>
                            </div>
                            <div className="mt-10 flex justify-between">
                                <button onClick={handlePrev} className="text-gray-400 font-bold px-6 py-3 hover:bg-white/5 rounded-xl transition">Kembali</button>
                                <button disabled={!customer.name || !customer.phone} onClick={handleNext} className="bg-purple-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-800 transition shadow-lg">
                                    Lanjut Pembayaran
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div key="step4" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.3 }}>
                            <h3 className="text-2xl font-bold mb-6 text-white">4. Ringkasan & Pembayaran</h3>

                            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-8">
                                <h4 className="font-bold text-lg border-b pb-3 mb-3 border-white/10 text-white">Detail Pesanan</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-400">Unit:</span> <span className="font-bold text-white">{selectedUnit.name}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">Tarif:</span> <span className="font-medium text-gray-300">Rp {selectedUnit.hourly_rate.toLocaleString()} / jam</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">Jadwal:</span> <span className="font-medium text-gray-300">{schedule.date} pukul {schedule.time}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">Durasi:</span> <span className="font-medium text-gray-300">{schedule.duration} Jam</span></div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                                    <span className="font-bold text-gray-300">Total Pembayaran:</span>
                                    <span className="text-3xl font-black text-purple-400">Rp {(selectedUnit.hourly_rate * schedule.duration).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h4 className="font-bold text-white mb-4">Pilih Metode Pembayaran</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div onClick={() => setPaymentMethod('qris')} className={`p-6 rounded-xl border-2 cursor-pointer flex flex-col items-center justify-center transition-all ${paymentMethod === 'qris' ? 'border-purple-500 bg-purple-500/10 shadow-lg' : 'border-white/10 hover:border-purple-400 hover:bg-white/5'}`}>
                                        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-2 text-blue-400 font-black">Q</div>
                                        <span className="font-bold text-white">QRIS / E-Wallet</span>
                                        <span className="text-xs text-gray-500 text-center mt-1">Otomatis Terverifikasi</span>
                                    </div>
                                    <div onClick={() => setPaymentMethod('cash')} className={`p-6 rounded-xl border-2 cursor-pointer flex flex-col items-center justify-center transition-all ${paymentMethod === 'cash' ? 'border-purple-500 bg-purple-500/10 shadow-lg' : 'border-white/10 hover:border-purple-400 hover:bg-white/5'}`}>
                                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-2 text-green-400 font-black">$</div>
                                        <span className="font-bold text-white">Bayar di Tempat</span>
                                        <span className="text-xs text-gray-500 text-center mt-1">Pembayaran Cash Tunai</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 flex justify-between">
                                <button onClick={handlePrev} className="text-gray-400 font-bold px-6 py-3 hover:bg-white/5 rounded-xl transition">Kembali</button>
                                <button disabled={isSubmitting} onClick={handleSubmit} className="bg-gradient-to-r from-purple-700 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center disabled:opacity-50">
                                    {isSubmitting ? 'Memproses...' : 'Bayar Sekarang'}
                                    {!isSubmitting && (
                                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
