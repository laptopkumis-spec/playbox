import React from 'react';

const STATUS_STYLES = {
    completed: 'bg-green-500/20 text-green-400',
    active:    'bg-blue-500/20 text-blue-400',
    scheduled: 'bg-purple-500/20 text-purple-400',
    pending:   'bg-yellow-500/20 text-yellow-400',
    cancelled: 'bg-white/10 text-gray-400',
    booked:    'bg-red-500/20 text-red-400',
};

export default function StatusBadge({ status }) {
    return (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'}`}>
            {status?.toUpperCase()}
        </span>
    );
}
