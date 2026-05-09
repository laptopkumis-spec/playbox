import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './Layouts/MainLayout';
import Home from './Pages/Home';
import Booking from './Pages/Booking';
import Dashboard from './Pages/Dashboard';
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';
import ForgotPassword from './Pages/Auth/ForgotPassword';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/booking" element={<Booking />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
