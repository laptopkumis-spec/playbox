import React from 'react';

const STATUS_STYLES = {
    completed: 'bg-green-100 text-green-800',
    active:    'bg-blue-100 text-blue-800',
    scheduled: 'bg-purple-100 text-purple-800',
    pending:   'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-gray-100 text-gray-600',
    booked:    'bg-red-100 text-red-700',
};

export default function StatusBadge({ status }) {
    return (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'}`}>
            {status?.toUpperCase()}
        </span>
    );
}
