import React from 'react';

export default function PaymentsTab({ bookings }) {
    return (
        <div className="glass-card shadow-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Riwayat Pembayaran</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">ID Transaksi</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">User</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Unit</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Jumlah</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Metode</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Tanggal</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {bookings.filter(b => b.payment).map(b => {
                            const p = b.payment?.data || b.payment;
                            const u = b.user?.data || b.user;
                            const unit = b.unit?.data || b.unit;
                            return (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">{p.external_id || 'TRX-'+p.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u?.name || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{unit?.name || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-green-600">Rp {parseInt(p.amount).toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs font-bold bg-blue-50 text-blue-700 rounded-lg uppercase">{p.payment_method || 'qris'}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{new Date(p.created_at).toLocaleString('id-ID', {dateStyle:'medium', timeStyle:'short'})}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${p.status === 'paid' ? 'bg-green-100 text-green-800' : p.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {(p.status || 'pending').toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                        {bookings.filter(b => b.payment).length === 0 && (
                            <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-400">Belum ada data pembayaran.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
