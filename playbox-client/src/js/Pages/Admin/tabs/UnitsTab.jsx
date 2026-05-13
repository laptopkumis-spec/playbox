import React, { useState } from 'react';
import axios from '../../../../api/axios';

export default function UnitsTab({ units, setUnits }) {
    const [showCreateUnit, setShowCreateUnit] = useState(false);
    const [newUnitForm, setNewUnitForm] = useState({ name: '', hourly_rate: '', description: '' });
    const [editingUnit, setEditingUnit] = useState(null);
    const [editUnitForm, setEditUnitForm] = useState({ name: '', hourly_rate: '', status: 'available' });

    const handleCreateUnit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/admin/units', newUnitForm, { headers: { Authorization: `Bearer ${token}` } });
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
            const token = localStorage.getItem('token');
            await axios.delete(`/admin/units/${unitId}`, { headers: { Authorization: `Bearer ${token}` } });
            setUnits(units.filter(u => u.id !== unitId));
        } catch (err) {
            alert(err.response?.data?.message || "Error deleting unit");
        }
    };

    const handleUpdateUnit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`/admin/units/${editingUnit.id}`, editUnitForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const updatedUnit = res.data.data || res.data;
            setUnits(units.map(u => u.id === editingUnit.id ? updatedUnit : u));
            setEditingUnit(null);
            alert("Unit berhasil diupdate!");
        } catch (err) {
            alert("Gagal update unit");
        }
    };

    return (
        <div className="glass-card shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Ketersediaan Unit</h3>
                <button onClick={() => setShowCreateUnit(!showCreateUnit)} className="bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    {showCreateUnit ? 'Batal' : '+ Tambah Unit'}
                </button>
            </div>

            {/* Form Create Unit */}
            {showCreateUnit && (
                <div className="mb-8 p-6 rounded-xl border border-white">
                    <h4 className="font-bold mb-4">Tambah Unit Baru</h4>
                    <form onSubmit={handleCreateUnit} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nama Unit</label>
                            <input required type="text" value={newUnitForm.name} onChange={e => setNewUnitForm({ ...newUnitForm, name: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="Contoh: PS5 - 01" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Tarif/Jam (Rp)</label>
                            <input required type="number" value={newUnitForm.hourly_rate} onChange={e => setNewUnitForm({ ...newUnitForm, hourly_rate: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="Contoh: 15000" />
                        </div>
                        <div className="md:col-span-2 pt-2">
                            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-bold shadow hover:bg-green-700">Simpan Unit</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Form Edit Unit */}
            {editingUnit && (
                <div className="mb-8 p-6 bg-purple-50 rounded-xl border border-purple-200">
                    <h4 className="font-bold mb-4">Edit Unit: {editingUnit.name}</h4>
                    <form onSubmit={handleUpdateUnit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Nama Unit</label>
                            <input required type="text" value={editUnitForm.name} onChange={e => setEditUnitForm({ ...editUnitForm, name: e.target.value })} className="w-full px-3 py-2 border rounded text-gray-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Tarif/Jam</label>
                            <input required type="number" value={editUnitForm.hourly_rate} onChange={e => setEditUnitForm({ ...editUnitForm, hourly_rate: e.target.value })} className="w-full px-3 py-2 border rounded text-gray-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
                            <select value={editUnitForm.status} onChange={e => setEditUnitForm({ ...editUnitForm, status: e.target.value })} className="w-full px-3 py-2 border rounded bg-white text-gray-900">
                                <option value="available">Available</option>
                                <option value="booked">Booked</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                        </div>
                        <div className="md:col-span-3 flex space-x-2 pt-2">
                            <button type="submit" className="bg-purple-700 text-white px-6 py-2 rounded font-bold shadow hover:bg-purple-800">Simpan Perubahan</button>
                            <button type="button" onClick={() => setEditingUnit(null)} className="bg-gray-300 text-gray-800 px-6 py-2 rounded font-bold hover:bg-gray-400">Batal</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Unit</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarif / Jam</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {units.map(unit => (
                            <tr key={unit.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{unit.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">Rp {unit.hourly_rate}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${unit.status === 'available' ? 'bg-green-100 text-green-700' : unit.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-700'}`}>
                                        {(unit.status || 'available').toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                    <button onClick={() => {
                                        setEditingUnit(unit);
                                        setEditUnitForm({ name: unit.name, hourly_rate: unit.hourly_rate, status: unit.status });
                                    }} className="text-purple-600 hover:text-purple-900">Edit</button>
                                    <button onClick={() => handleDeleteUnit(unit.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
