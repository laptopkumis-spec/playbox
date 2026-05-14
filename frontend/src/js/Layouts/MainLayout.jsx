import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';

export default function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
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

    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

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

            <nav className="glass-nav text-gray-100 shadow-xl sticky top-0 z-[60]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="text-2xl sm:text-3xl font-black tracking-tighter text-playbox drop-shadow-sm">
                                PLAYBOX
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-2">
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
                                    <button onClick={handleLogout} className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors cursor-pointer">Logout</button>
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

                        {/* Mobile Menu Button */}
                        <div className="flex md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-all"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Drawer */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t border-white/10 bg-black/60 backdrop-blur-xl overflow-hidden"
                        >
                            <div className="px-4 py-6 space-y-3">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`block px-4 py-3 rounded-xl font-bold transition-all ${location.pathname === link.path ? 'bg-purple-700 text-white shadow-lg shadow-purple-900/20' : 'text-gray-400 hover:bg-white/5'}`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                
                                <div className="pt-4 border-t border-white/10">
                                    {user ? (
                                        <div className="space-y-3">
                                            <div className="px-4 text-sm text-gray-500">Logged in as <span className="text-white font-bold">{user.name}</span></div>
                                            <button
                                                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                                className="w-full text-left px-4 py-3 rounded-xl font-bold text-red-400 hover:bg-red-500/10 transition-all"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3">
                                            {authLinks.map((link) => (
                                                <Link
                                                    key={link.path}
                                                    to={link.path}
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className={`text-center px-4 py-3 rounded-xl font-bold transition-all ${location.pathname === link.path ? 'bg-purple-900/50 text-white' : 'bg-white/5 text-gray-300'}`}
                                                >
                                                    {link.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
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
