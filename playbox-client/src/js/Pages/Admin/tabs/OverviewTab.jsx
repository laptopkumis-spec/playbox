import React from 'react';

export default function OverviewTab({ stats, units }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 shadow-2xl">
                <p className="text-sm font-medium text-gray-400 mb-1">Total Pemasukan</p>
                <p className="text-3xl font-black text-green-400">
                    Rp {parseInt(stats.revenue).toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                    Bulan Ini:{' '}
                    <span className="font-bold text-green-400">
                        Rp {parseInt(stats.monthly_revenue || 0).toLocaleString('id-ID')}
                    </span>
                </p>
            </div>

            <div className="glass-card p-6 shadow-2xl">
                <p className="text-sm font-medium text-gray-400 mb-1">Total Unit (Ketersediaan)</p>
                <p className="text-3xl font-black text-white">
                    {units.length > 0 ? units.length : stats.total_units} Unit
                </p>
                <p className="text-xs text-gray-500 mt-2">
                    Unit Tersedia:{' '}
                    <span className="font-bold text-blue-400">
                        {units.filter(u => u.status === 'available').length}
                    </span>
                    {' | '}
                    Booked:{' '}
                    <span className="font-bold text-red-400">
                        {units.filter(u => u.status === 'booked').length}
                    </span>
                </p>
            </div>

            <div className="glass-card p-6 shadow-2xl">
                <p className="text-sm font-medium text-gray-400 mb-1">Booking Aktif Saat Ini</p>
                <p className="text-3xl font-black text-purple-400">{stats.active_bookings}</p>
                <p className="text-xs text-gray-500 mt-2">
                    Total Semua Booking:{' '}
                    <span className="font-bold text-white">{stats.total_bookings || 0}</span>
                </p>
            </div>
        </div>
    );
}
