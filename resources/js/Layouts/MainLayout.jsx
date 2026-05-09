import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Determine which nav links to show based on role
    const navLinks = user?.role === 'admin'
        ? [
            { path: '/dashboard', label: 'Dashboard Admin' }
        ]
        : [
            { path: '/', label: 'Home' },
            { path: '/booking', label: 'Book Now' },
            ...(user ? [{ path: '/dashboard', label: 'Dashboard' }] : [])
        ];

    const authLinks = !user ? [
        { path: '/login', label: 'Login' },
        { path: '/register', label: 'Register' }
    ] : [];

    return (
        <div className="flex flex-col min-h-screen text-white font-sans selection:bg-purple-500 selection:text-white relative">
            {/* Milky Way Background Background */}
            <div className="milky-way-container">
                <div className="stars"></div>
                <div className="twinkling"></div>
                <div className="shooting-star"></div>
                <div className="shooting-star"></div>
                <div className="shooting-star"></div>
                <div className="shooting-star"></div>
                <div className="shooting-star"></div>
                <div className="shooting-star"></div>
                <div className="shooting-star"></div>
                <div className="shooting-star"></div>
                <div className="shooting-star"></div>
                <div className="shooting-star"></div>
            </div>

            <nav className="glass-nav text-gray-100 shadow-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="text-3xl font-black tracking-tighter text-playbox drop-shadow-sm">
                                PLAYBOX
                            </Link>
                        </div>
                        <div className="hidden sm:flex items-center space-x-2">
                            {/* Animated Nav Links */}
                            {navLinks.map((link) => {
                                const isActive = location.pathname === link.path;
                                return (
                                    <Link key={link.path} to={link.path} className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-colors z-10 ${isActive ? 'text-white' : 'text-gray-400 hover:text-purple-400'}`}>
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-pill"
                                                className="absolute inset-0 bg-purple-700 rounded-lg -z-10"
                                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                            />
                                        )}
                                        {link.label}
                                    </Link>
                                );
                            })}

                            {user ? (
                                <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-white/10">
                                    <span className="text-sm font-medium text-gray-300">Hi, {user.name}</span>
                                    <button onClick={handleLogout} className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors">Logout</button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-white/10">
                                    {authLinks.map((link) => {
                                        const isActive = location.pathname === link.path;
                                        return (
                                            <Link key={link.path} to={link.path} className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-colors z-10 ${isActive ? 'text-white' : 'text-gray-300 hover:text-purple-400'}`}>
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="auth-pill"
                                                        className="absolute inset-0 bg-purple-900/50 rounded-lg -z-10"
                                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                                    />
                                                )}
                                                {link.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area - flex-grow pushes footer down */}
            <main className="flex-grow flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="min-h-screen bg-transparent"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Footer always at the bottom */}
            <footer className="glass-card mt-auto border-t-0 rounded-none rounded-t-3xl py-10 text-center text-sm w-full">
                <div className="max-w-7xl mx-auto px-4">
                    <p className="text-gray-400">&copy; {new Date().getFullYear()} <span className="text-playbox">Playbox</span>. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
