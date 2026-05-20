import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, adminOnly = false }) {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    // Jika tidak ada token atau user, arahkan ke login
    if (!token || !user) {
        return <Navigate to="/login" replace state={{ message: 'Silakan login terlebih dahulu.' }} />;
    }

    // Jika rute ini khusus admin dan user bukan admin, arahkan ke dashboard biasa
    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
