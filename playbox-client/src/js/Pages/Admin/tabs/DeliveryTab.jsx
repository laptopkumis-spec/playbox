import React from 'react';

export default function DeliveryTab() {
    return (
        <div className="glass-card shadow-2xl p-10 text-center">
            <div className="mx-auto w-20 h-20 bg-purple-900/30 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Manajemen Delivery Kurir</h3>
            <p className="text-gray-500 max-w-md mx-auto">
                Sistem difokuskan pada penggunaan "Play-in" di tempat. Modul delivery sedang dalam tahap persiapan untuk pengantaran unit (rent out).
            </p>
        </div>
    );
}
