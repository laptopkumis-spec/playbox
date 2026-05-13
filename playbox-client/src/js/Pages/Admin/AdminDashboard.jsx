import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import OverviewTab from './tabs/OverviewTab';
import UsersTab from './tabs/UsersTab';
import UnitsTab from './tabs/UnitsTab';
import BookingsTab from './tabs/BookingsTab';
import PaymentsTab from './tabs/PaymentsTab';
import DeliveryTab from './tabs/DeliveryTab';
import ReportsTab from './tabs/ReportsTab';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({ revenue: 0, monthly_revenue: 0, active_bookings: 0, total_bookings: 0, total_units: 0 });
    const [units, setUnits] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (activeTab === 'overview') {
                    // Fetch both dashboard stats and units for a complete overview
                    const [dashRes, unitRes] = await Promise.all([
                        api.get('/admin/dashboard'),
                        api.get('/admin/units')
                    ]);
                    
                    setStats({
                        revenue: dashRes.data.total_revenue || 0,
                        monthly_revenue: dashRes.data.monthly_revenue || 0,
                        active_bookings: dashRes.data.active_bookings || 0,
                        total_bookings: dashRes.data.total_bookings || 0,
                        total_units: dashRes.data.total_units || 0,
                    });
                    setUnits(unitRes.data.data || unitRes.data);
                } else if (activeTab === 'units') {
                    const res = await api.get('/admin/units');
                    setUnits(res.data.data || res.data);
                } else if (activeTab === 'bookings' || activeTab === 'payments') {
                    const res = await api.get('/admin/bookings');
                    setBookings(res.data.data || res.data);
                } else if (activeTab === 'users') {
                    const res = await api.get('/admin/users');
                    setUsers(res.data.data || res.data);
                } else if (activeTab === 'reports') {
                    const res = await api.get('/admin/reports');
                    setReportData(res.data);
                }
            } catch (err) {
                console.error('Admin Fetch Error:', err);
            }
        };

        fetchData();
    }, [activeTab]);

    return (
        <div className="py-6 sm:py-8 animate-in fade-in duration-500 max-w-full px-1">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-6 sm:mb-8 tracking-tight px-1">Admin <span className="text-playbox">Control Panel</span></h2>

            {/* Tabs Navigation */}
            <div className="flex space-x-2 mb-8 pb-4 overflow-x-auto no-scrollbar scroll-smooth px-1">
                {[
                    { id: 'overview', label: 'Analisa' },
                    { id: 'users', label: 'User' },
                    { id: 'units', label: 'Unit' },
                    { id: 'bookings', label: 'Booking' },
                    { id: 'payments', label: 'Pembayaran' },
                    { id: 'reports', label: 'Laporan' },
                    { id: 'delivery', label: 'Delivery' }
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm capitalize whitespace-nowrap transition-all border ${activeTab === tab.id ? 'bg-purple-700 text-white shadow-lg border-purple-500' : 'bg-white/5 text-gray-400 hover:bg-white/10 border-white/5'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Contents */}
            <div className="transition-all duration-300">
                {activeTab === 'overview' && <OverviewTab stats={stats} units={units} />}
                {activeTab === 'users' && <UsersTab users={users} setUsers={setUsers} />}
                {activeTab === 'units' && <UnitsTab units={units} setUnits={setUnits} />}
                {activeTab === 'bookings' && <BookingsTab bookings={bookings} setBookings={setBookings} />}
                {activeTab === 'payments' && <PaymentsTab bookings={bookings} />}
                {activeTab === 'reports' && <ReportsTab data={reportData} />}
                {activeTab === 'delivery' && <DeliveryTab />}
            </div>
        </div>
    );
}
