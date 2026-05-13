import React from 'react';
import api from '../../../../api/axios';
import StatusBadge from '../../../Components/StatusBadge';

export default function BookingsTab({ bookings, setBookings }) {
    const handleStatusUpdate = async (id, status) => {
        if (!window.confirm(`Yakin ingin mengubah status menjadi ${status}?`)) return;
        try {
            await api.put(`/admin/bookings/${id}/status`, { status });
            // Refresh list
            const res = await api.get('/admin/bookings');
            setBookings(res.data.data || res.data);
            alert("Status berhasil diperbarui!");
        } catch (err) {
            alert("Gagal memperbarui status");
        }
    };

    const handleFinePaid = async (id) => {
        if (!window.confirm("Tandai denda sebagai lunas?")) return;
        try {
            await api.put(`/admin/bookings/${id}/fine-status`, {});
            const res = await api.get('/admin/bookings');
            setBookings(res.data.data || res.data); // Handle Resource collection wrap
            alert("Denda dilunaskan!");
        } catch (err) {
            alert("Gagal melunaskan denda");
        }
    };

    return (
        <div className="glass-card shadow-2xl p-4 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Kelola Booking</h3>
            <div className="overflow-x-auto no-scrollbar">
                <table className="min-w-full divide-y divide-white/5">
                    <thead>
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Unit</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Waktu</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Denda</th>
                            <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {bookings.map(b => (
                            <tr key={b.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">{b.user?.data?.name || b.user?.name || 'User Dihapus'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{b.unit?.data?.name || b.unit?.name || 'Unit Dihapus'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                    <div className="font-medium text-gray-200">{new Date(b.start_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                                    <div className="text-[10px] font-bold text-gray-500">
                                        {new Date(b.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {new Date(b.end_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <StatusBadge status={b.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {b.total_fines > 0 ? (
                                        <div className="flex flex-col">
                                            <span className="font-bold text-red-400">Rp {parseInt(b.total_fines).toLocaleString('id-ID')}</span>
                                            <span className={`text-[10px] font-black uppercase ${b.fine_status === 'paid' ? 'text-green-500' : 'text-red-500/60'}`}>
                                                {b.fine_status === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
                                            </span>
                                        </div>
                                    ) : <span className="text-gray-600">-</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <div className="flex justify-end gap-2">
                                        {b.fine_status === 'unpaid' && b.total_fines > 0 && (
                                            <button onClick={() => handleFinePaid(b.id)} className="text-[10px] text-orange-400 hover:text-orange-300 font-bold bg-orange-400/10 border border-orange-400/20 px-2.5 py-1.5 rounded-lg transition-all">Bayar Denda</button>
                                        )}
                                        {b.status === 'active' && (
                                            <button onClick={() => handleStatusUpdate(b.id, 'completed')} className="text-[10px] text-green-400 hover:text-green-300 font-bold bg-green-400/10 border border-green-400/20 px-2.5 py-1.5 rounded-lg transition-all">Selesaikan</button>
                                        )}
                                        {b.status === 'pending' && (
                                            <button onClick={() => handleStatusUpdate(b.id, 'active')} className="text-[10px] text-blue-400 hover:text-blue-300 font-bold bg-blue-400/10 border border-blue-200/20 px-2.5 py-1.5 rounded-lg transition-all">Aktifkan</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {bookings.length === 0 && (
                            <tr><td colSpan="6" className="px-6 py-16 text-center text-gray-500">Belum ada data booking.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
