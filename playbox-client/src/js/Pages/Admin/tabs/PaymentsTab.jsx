import React from 'react';

export default function PaymentsTab({ bookings }) {
    return (
        <div className="glass-card shadow-2xl p-4 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Riwayat Pembayaran</h3>
            <div className="overflow-x-auto no-scrollbar">
                <table className="min-w-full divide-y divide-white/5">
                    <thead>
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Unit</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Jumlah</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Metode</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {bookings.filter(b => b.payment).map(b => {
                            const p = b.payment?.data || b.payment;
                            const u = b.user?.data || b.user;
                            const unit = b.unit?.data || b.unit;
                            return (
                                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-[10px] text-gray-500 font-mono">{p.external_id || 'TRX-'+p.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{u?.name || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{unit?.name || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-green-400">Rp {parseInt(p.amount).toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-[10px] font-black bg-blue-500/20 text-blue-400 rounded tracking-widest uppercase">{p.payment_method || 'qris'}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-[10px] text-gray-500">{new Date(p.created_at).toLocaleString('id-ID', {dateStyle:'medium', timeStyle:'short'})}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black tracking-widest ${p.status === 'paid' ? 'bg-green-500/20 text-green-400' : p.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                            {(p.status || 'pending').toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                        {bookings.filter(b => b.payment).length === 0 && (
                            <tr><td colSpan="7" className="px-6 py-16 text-center text-gray-500">Belum ada data pembayaran.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
