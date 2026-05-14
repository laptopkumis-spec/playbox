import React, { useState } from 'react';
import api from '../../../../api/axios';

export default function UnitsTab({ units, setUnits }) {
    const [showCreateUnit, setShowCreateUnit] = useState(false);
    const [newUnitForm, setNewUnitForm] = useState({ name: '', hourly_rate: '', description: '' });
    const [editingUnit, setEditingUnit] = useState(null);
    const [editUnitForm, setEditUnitForm] = useState({ name: '', hourly_rate: '', status: 'available' });

    const handleCreateUnit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/admin/units', newUnitForm);
            setUnits([...units, res.data.data || res.data]);
            setShowCreateUnit(false);
            setNewUnitForm({ name: '', hourly_rate: '', description: '' });
            alert("Unit created successfully!");
        } catch (err) {
            alert(err.response?.data?.message || "Error creating unit");
        }
    };

    const handleDeleteUnit = async (unitId) => {
        if (!window.confirm("Are you sure you want to delete this unit?")) return;
        try {
            await api.delete(`/admin/units/${unitId}`);
            setUnits(units.filter(u => u.id !== unitId));
        } catch (err) {
            alert(err.response?.data?.message || "Error deleting unit");
        }
    };

    const handleUpdateUnit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/admin/units/${editingUnit.id}`, editUnitForm);
            const updatedUnit = res.data.data || res.data;
            setUnits(units.map(u => u.id === editingUnit.id ? updatedUnit : u));
            setEditingUnit(null);
            alert("Unit berhasil diupdate!");
        } catch (err) {
            alert("Gagal update unit");
        }
    };

    return (
        <div className="glass-card shadow-2xl p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-xl sm:text-2xl font-bold text-white">Ketersediaan Unit</h3>
                <button onClick={() => setShowCreateUnit(!showCreateUnit)} className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg ${showCreateUnit ? 'bg-white/10 text-gray-400' : 'bg-purple-700 text-white shadow-purple-900/20'}`}>
                    {showCreateUnit ? 'Batal' : '+ Tambah Unit'}
                </button>
            </div>

            {/* Form Create Unit */}
            {showCreateUnit && (
                <div className="mb-8 p-5 sm:p-6 bg-white/5 rounded-2xl border border-white/10">
                    <h4 className="font-bold mb-4 text-white">Tambah Unit Baru</h4>
                    <form onSubmit={handleCreateUnit} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 px-1">Nama Unit</label>
                            <input required type="text" value={newUnitForm.name} onChange={e => setNewUnitForm({ ...newUnitForm, name: e.target.value })} 
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 text-white outline-none" placeholder="Contoh: PS5 - 01" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 px-1">Tarif/Jam (Rp)</label>
                            <input required type="number" value={newUnitForm.hourly_rate} onChange={e => setNewUnitForm({ ...newUnitForm, hourly_rate: e.target.value })} 
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 text-white outline-none" placeholder="Contoh: 15000" />
                        </div>
                        <div className="md:col-span-2 pt-2">
                            <button type="submit" className="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-black shadow-lg transition-all active:scale-[0.98]">
                                SIMPAN UNIT
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Form Edit Unit */}
            {editingUnit && (
                <div className="mb-8 p-5 sm:p-6 bg-purple-500/5 rounded-2xl border border-purple-500/20">
                    <h4 className="font-bold mb-4 text-white">Edit Unit: {editingUnit.name}</h4>
                    <form onSubmit={handleUpdateUnit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 px-1">Nama Unit</label>
                            <input required type="text" value={editUnitForm.name} onChange={e => setEditUnitForm({ ...editUnitForm, name: e.target.value })} 
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 text-white outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 px-1">Tarif/Jam</label>
                            <input required type="number" value={editUnitForm.hourly_rate} onChange={e => setEditUnitForm({ ...editUnitForm, hourly_rate: e.target.value })} 
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 text-white outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 px-1">Status</label>
                            <select value={editUnitForm.status} onChange={e => setEditUnitForm({ ...editUnitForm, status: e.target.value })} 
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 text-white outline-none">
                                <option className="bg-gray-900" value="available">Available</option>
                                <option className="bg-gray-900" value="booked">Booked</option>
                                <option className="bg-gray-900" value="maintenance">Maintenance</option>
                            </select>
                        </div>
                        <div className="md:col-span-3 flex flex-col sm:flex-row gap-2 pt-2">
                            <button type="submit" className="bg-purple-700 hover:bg-purple-600 text-white px-8 py-3 rounded-xl font-black shadow-lg transition-all active:scale-[0.98]">
                                SIMPAN PERUBAHAN
                            </button>
                            <button type="button" onClick={() => setEditingUnit(null)} className="bg-white/5 text-gray-400 px-8 py-3 rounded-xl font-black hover:bg-white/10 transition-all">
                                BATAL
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-x-auto no-scrollbar">
                <table className="min-w-full divide-y divide-white/5">
                    <thead>
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nama Unit</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tarif / Jam</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {units.map(unit => (
                            <tr key={unit.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-white">{unit.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-400">Rp {unit.hourly_rate.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-[10px] font-black rounded tracking-widest ${unit.status === 'available' ? 'bg-green-500/20 text-green-400' : unit.status === 'maintenance' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {(unit.status || 'available').toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                    <button onClick={() => {
                                        setEditingUnit(unit);
                                        setEditUnitForm({ name: unit.name, hourly_rate: unit.hourly_rate, status: unit.status });
                                    }} className="text-purple-400 hover:text-purple-300 font-bold bg-purple-400/10 border border-purple-400/20 px-3 py-1.5 rounded-lg transition-all">Edit</button>
                                    <button onClick={() => handleDeleteUnit(unit.id)} className="text-red-400 hover:text-red-300 font-bold bg-red-400/10 border border-red-400/20 px-3 py-1.5 rounded-lg transition-all">Hapus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
