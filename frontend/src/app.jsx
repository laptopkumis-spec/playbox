import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './js/Layouts/MainLayout';
import Home from './js/Pages/Home';
import Booking from './js/Pages/Booking';
import Dashboard from './js/Pages/Dashboard';
import Login from './js/Pages/Auth/Login';
import Register from './js/Pages/Auth/Register';
import ForgotPassword from './js/Pages/Auth/ForgotPassword';

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

export default App;
