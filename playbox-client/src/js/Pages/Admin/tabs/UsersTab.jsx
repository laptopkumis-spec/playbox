import React, { useState } from 'react';
import axios from '../../../../api/axios';

export default function UsersTab({ users, setUsers }) {
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });
    const [showCreate, setShowCreate] = useState(false);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/admin/users', newUser, {
                headers: { Authorization: `Bearer ${token}` },
            });
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
            const token = localStorage.getItem('token');
            await axios.delete(`/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            alert(err.response?.data?.message || 'Error menghapus user');
        }
    };

    return (
        <div className="glass-card shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">User Management</h3>
                <button onClick={() => setShowCreate(!showCreate)}
                    className="bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    {showCreate ? 'Batal' : '+ Tambah User/Admin'}
                </button>
            </div>

            {showCreate && (
                <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <h4 className="font-bold mb-4">Buat Akun Baru</h4>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nama</label>
                            <input required type="text" value={newUser.name}
                                onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                className="w-full px-3 py-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input required type="email" value={newUser.email}
                                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                className="w-full px-3 py-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Password</label>
                            <input required type="password" value={newUser.password} minLength="8"
                                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                className="w-full px-3 py-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Role</label>
                            <select value={newUser.role}
                                onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                className="w-full px-3 py-2 border rounded bg-gray-50">
                                <option class="text-black" value="user">User</option>
                                <option class="text-black" value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 pt-2">
                            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-bold shadow hover:bg-green-700">
                                Simpan Akun
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.map(u => (
                            <tr key={u.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{u.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {u.role.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    {u.role !== 'admin' && (
                                        <button onClick={() => handleDelete(u.id)}
                                            className="text-red-600 hover:text-red-900 font-medium">
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
