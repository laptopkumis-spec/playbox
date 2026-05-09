import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const fetchData = async () => {
            try {
                if (activeTab === 'overview') {
                    const res = await axios.get('/api/admin/dashboard', config);
                    setStats({
                        revenue: res.data.total_revenue || 0,
                        monthly_revenue: res.data.monthly_revenue || 0,
                        active_bookings: res.data.active_bookings || 0,
                        total_bookings: res.data.total_bookings || 0,
                        total_units: res.data.total_units || 0,
                    });
                } else if (activeTab === 'units') {
                    const res = await axios.get('/api/admin/units', config);
                    setUnits(res.data.data || res.data);
                } else if (activeTab === 'bookings' || activeTab === 'payments') {
                    const res = await axios.get('/api/admin/bookings', config);
                    setBookings(res.data.data || res.data);
                } else if (activeTab === 'users') {
                    const res = await axios.get('/api/admin/users', config);
                    setUsers(res.data.data || res.data);
                } else if (activeTab === 'reports') {
                    const res = await axios.get('/api/admin/reports', config);
                    setReportData(res.data);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, [activeTab]);

    return (
        <div className="py-8 animate-in fade-in duration-500">
            <h2 className="text-4xl font-black text-white mb-8 tracking-tight">Admin <span className="text-playbox">Control Panel</span></h2>
            
            {/* Tabs Navigation */}
            <div className="flex space-x-2 border-b border-gray-200 mb-8 pb-4 overflow-x-auto">
                {[
                    { id: 'overview', label: 'Analisa (Overview)' },
                    { id: 'users', label: 'Manage Users' },
                    { id: 'units', label: 'Manage Units' },
                    { id: 'bookings', label: 'Manage Bookings' },
                    { id: 'payments', label: 'Riwayat Pembayaran' },
                    { id: 'reports', label: 'Laporan Bisnis' },
                    { id: 'delivery', label: 'Manage Delivery' }
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg font-medium capitalize whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-purple-700 text-white shadow-md' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
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
