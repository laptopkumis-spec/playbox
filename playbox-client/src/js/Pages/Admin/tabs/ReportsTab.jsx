import React from 'react';
import { motion } from 'framer-motion';

export default function ReportsTab({ data }) {
    if (!data) return <div className="text-white text-center py-20">Memuat data laporan...</div>;

    const { summary, revenue_chart, popular_units, peak_hours } = data;

    return (
        <div className="space-y-8 pb-10">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-green-500/30">
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Total Pendapatan Sewa</p>
                    <p className="text-3xl font-black text-white mt-2">Rp {parseInt(summary.total_revenue).toLocaleString('id-ID')}</p>
                </div>
                <div className="glass-card p-6 border-orange-500/30">
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Total Pendapatan Denda</p>
                    <p className="text-3xl font-black text-white mt-2">Rp {parseInt(summary.total_fines).toLocaleString('id-ID')}</p>
                </div>
                <div className="glass-card p-6 border-purple-500/30">
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Grand Total (Omzet)</p>
                    <p className="text-3xl font-black text-purple-400 mt-2">Rp {parseInt(summary.grand_total).toLocaleString('id-ID')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Popular Units */}
                <div className="glass-card p-8">
                    <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        Unit Terlaris (Berdasarkan Frekuensi Booking)
                    </h4>
                    <div className="space-y-4">
                        {popular_units.map((unit, idx) => (
                            <div key={unit.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex items-center space-x-4">
                                    <span className="text-lg font-black text-gray-500">#{idx + 1}</span>
                                    <div>
                                        <p className="text-white font-bold">{unit.name}</p>
                                        <p className="text-xs text-gray-400">{unit.description || 'Unit Gaming PS'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-purple-400 font-black">{unit.bookings_count}</p>
                                    <p className="text-[10px] text-gray-500 uppercase">Kali Disewa</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Peak Hours */}
                <div className="glass-card p-8">
                    <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Jam Sibuk (Peak Hours)
                    </h4>
                    <div className="space-y-4">
                        {peak_hours.map((item, idx) => (
                            <div key={idx} className="relative">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-sm font-bold text-white">Jam {item.hour}:00</span>
                                    <span className="text-xs text-gray-400">{item.count} Booking</span>
                                </div>
                                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(item.count / peak_hours[0].count) * 100}%` }}
                                        transition={{ duration: 1, delay: idx * 0.1 }}
                                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-500"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-6">* Data ini membantu Anda menentukan jam promo atau penambahan staf.</p>
                </div>
            </div>

            {/* Revenue Chart (Simple Table representation as chart mockup) */}
            <div className="glass-card p-8">
                <h4 className="text-xl font-bold text-white mb-6">Tren Pendapatan (7 Hari Terakhir)</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="text-gray-500 text-xs uppercase font-bold border-b border-white/10">
                                <th className="px-6 py-4 text-left">Tanggal</th>
                                <th className="px-6 py-4 text-right">Pendapatan</th>
                                <th className="px-6 py-4 text-right">Progress</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {revenue_chart.map((item, idx) => (
                                <tr key={idx} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-sm text-white font-medium">
                                        {new Date(item.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-bold text-green-400">
                                        Rp {parseInt(item.total).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end">
                                            <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-green-500"
                                                    style={{ width: `${(item.total / Math.max(...revenue_chart.map(r => r.total))) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
