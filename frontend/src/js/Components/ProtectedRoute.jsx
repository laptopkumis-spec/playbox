import React from 'react';
import { Navigate } from 'react-router-dom';

// Decode JWT payload without verifying signature (verification happens on the server).
// Used only to check expiry client-side so we don't send obviously stale tokens.
function getTokenExpiry(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return payload.exp ? payload.exp * 1000 : null;
    } catch {
        return null;
    }
}

export default function ProtectedRoute({ children, adminOnly = false }) {
    const token = localStorage.getItem('token');
    const user  = JSON.parse(localStorage.getItem('user') || 'null');

    // No session at all
    if (!token || !user) {
        return <Navigate to="/login" replace state={{ message: 'Silakan login terlebih dahulu.' }} />;
    }

    // Token is clearly expired client-side — clear and redirect
    const expiry = getTokenExpiry(token);
    if (expiry && Date.now() > expiry) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return <Navigate to="/login" replace state={{ message: 'Sesi Anda telah berakhir. Silakan login kembali.' }} />;
    }

    // Admin-only route: user role from localStorage is used only for UI routing.
    // The actual enforcement is done server-side via isAdmin middleware.
    // A user who tampers with localStorage will still get 403 from every API call.
    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
