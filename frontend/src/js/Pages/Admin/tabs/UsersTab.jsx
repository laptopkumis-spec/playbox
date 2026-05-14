import React, { useState } from 'react';
import api from '../../../../api/axios';

export default function UsersTab({ users, setUsers }) {
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });
    const [showCreate, setShowCreate] = useState(false);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/admin/users', newUser);
            setUsers([res.data.data || res.data, ...users]);
            setShowCreate(false);
            setNewUser({ name: '', email: '', password: '', role: 'user' });
            alert('User berhasil dibuat!');
        } catch (err) {
            alert(err.response?.data?.message || 'Error membuat user');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Yakin ingin menghapus user ini?')) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            alert(err.response?.data?.message || 'Error menghapus user');
        }
    };

    return (
        <div className="glass-card shadow-2xl p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-xl sm:text-2xl font-bold text-white">Manajemen User</h3>
                <button onClick={() => setShowCreate(!showCreate)}
                    className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg ${showCreate ? 'bg-white/10 text-gray-400' : 'bg-purple-700 text-white shadow-purple-900/20'}`}>
                    {showCreate ? 'Batal' : '+ Tambah User'}
                </button>
            </div>

            {showCreate && (
                <div className="mb-8 p-5 sm:p-6 bg-white/5 rounded-2xl border border-white/10">
                    <h4 className="font-bold mb-4 text-white">Buat Akun Baru</h4>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 px-1">Nama</label>
                            <input required type="text" value={newUser.name}
                                onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 text-white outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 px-1">Email</label>
                            <input required type="email" value={newUser.email}
                                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 text-white outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 px-1">Password</label>
                            <input required type="password" value={newUser.password} minLength="8"
                                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 text-white outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 px-1">Role</label>
                            <select value={newUser.role}
                                onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 text-white outline-none">
                                <option className="bg-gray-900 text-white" value="user">User</option>
                                <option className="bg-gray-900 text-white" value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 pt-2">
                            <button type="submit" className="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-black shadow-lg transition-all active:scale-[0.98]">
                                SIMPAN AKUN
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-x-auto no-scrollbar">
                <table className="min-w-full divide-y divide-white/5">
                    <thead>
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nama</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">{u.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{u.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 rounded text-[10px] font-black tracking-widest ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                        {u.role.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    {u.role !== 'admin' && (
                                        <button onClick={() => handleDelete(u.id)}
                                            className="text-red-400 hover:text-red-300 font-bold bg-red-400/10 border border-red-400/20 px-3 py-1.5 rounded-lg transition-all">
                                            Hapus
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
