import React from 'react';
import axios from 'axios';
import StatusBadge from '../../../Components/StatusBadge';

export default function BookingsTab({ bookings, setBookings }) {
    const handleStatusUpdate = async (id, status) => {
        if (!window.confirm(`Yakin ingin mengubah status menjadi ${status}?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/admin/bookings/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Refresh list
            const res = await axios.get('/api/admin/bookings', { headers: { Authorization: `Bearer ${token}` } });
            setBookings(res.data.data || res.data);
            alert("Status berhasil diperbarui!");
        } catch (err) {
            alert("Gagal memperbarui status");
        }
    };

    const handleFinePaid = async (id) => {
        if (!window.confirm("Tandai denda sebagai lunas?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/admin/bookings/${id}/fine-status`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const res = await axios.get('/api/admin/bookings', { headers: { Authorization: `Bearer ${token}` } });
            setBookings(res.data.data || res.data); // Handle Resource collection wrap
            alert("Denda dilunaskan!");
        } catch (err) {
            alert("Gagal melunaskan denda");
        }
    };

    return (
        <div className="glass-card shadow-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Kelola Booking</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Denda</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {bookings.map(b => (
                            <tr key={b.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{b.user?.data?.name || b.user?.name || 'User Dihapus'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{b.unit?.data?.name || b.unit?.name || 'Unit Dihapus'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div>{new Date(b.start_time).toLocaleDateString('id-ID')}</div>
                                    <div className="text-xs font-bold text-gray-400">
                                        {new Date(b.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {new Date(b.end_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <StatusBadge status={b.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {b.total_fines > 0 ? (
                                        <div className="flex flex-col">
                                            <span className="font-bold text-red-600">Rp {parseInt(b.total_fines).toLocaleString('id-ID')}</span>
                                            <span className={`text-[10px] font-black uppercase ${b.fine_status === 'paid' ? 'text-green-500' : 'text-red-400'}`}>
                                                {b.fine_status}
                                            </span>
                                        </div>
                                    ) : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <div className="flex justify-end gap-2">
                                        {b.fine_status === 'unpaid' && b.total_fines > 0 && (
                                            <button onClick={() => handleFinePaid(b.id)} className="text-orange-600 hover:text-orange-900 font-bold border border-orange-200 px-3 py-1 rounded-lg bg-orange-50 transition">Bayar Denda</button>
                                        )}
                                        {b.status === 'active' && (
                                            <button onClick={() => handleStatusUpdate(b.id, 'completed')} className="text-green-600 hover:text-green-900 font-bold border border-green-200 px-3 py-1 rounded-lg bg-green-50 transition">Selesaikan</button>
                                        )}
                                        {b.status === 'pending' && (
                                            <button onClick={() => handleStatusUpdate(b.id, 'active')} className="text-blue-600 hover:text-blue-900 font-bold border border-blue-200 px-3 py-1 rounded-lg bg-blue-50 transition">Aktifkan</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {bookings.length === 0 && (
                            <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400">Belum ada data booking.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
