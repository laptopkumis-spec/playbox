import React, { useEffect, useState } from 'react';

export default function CountdownTimer({ endTime }) {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const tick = () => {
            const distance = new Date(endTime).getTime() - Date.now();
            if (distance <= 0) {
                setTimeLeft('Waktu Habis');
                return;
            }
            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);
            setTimeLeft(`${h}j ${m}m ${s}d`);
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [endTime]);

    return (
        <span className="inline-block font-mono font-bold text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-lg mt-1">
            ⏱ {timeLeft}
        </span>
    );
}
