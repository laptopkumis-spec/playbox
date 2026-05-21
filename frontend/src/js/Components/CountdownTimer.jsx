import { useEffect, useState } from 'react';

/**
 * CountdownTimer — dark-theme aware, live countdown.
 *
 * Props:
 *  - endTime  : ISO string or datetime string from DB
 *  - variant  : 'active' (green/purple, sisa main) | 'payment' (amber, batas bayar)
 */
export default function CountdownTimer({ endTime, variant = 'active' }) {
    const [parts, setParts] = useState(null); // { h, m, s, total }
    const [expired, setExpired] = useState(false);

    useEffect(() => {
        if (!endTime) { setExpired(true); return; }

        const tick = () => {
            // Handle both "2026-05-22 14:00:00" and ISO "2026-05-22T14:00:00.000Z"
            const end = new Date(endTime.includes('T') ? endTime : endTime.replace(' ', 'T'));
            const distance = end.getTime() - Date.now();

            if (distance <= 0) {
                setExpired(true);
                setParts(null);
                return;
            }

            const h = Math.floor(distance / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);
            setParts({ h, m, s, total: distance });
            setExpired(false);
        };

        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [endTime]);

    // ── Expired state ──────────────────────────────────────────────────────
    if (expired) {
        return (
            <div className="inline-flex items-center gap-1.5 bg-gray-500/10 border border-gray-500/20 rounded-lg px-2.5 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500 shrink-0" />
                <span className="font-mono font-bold text-[11px] text-gray-500 tracking-wide">
                    Waktu Habis
                </span>
            </div>
        );
    }

    if (!parts) return null;

    const { h, m, s, total } = parts;

    // ── Color scheme based on variant & urgency ────────────────────────────
    const isUrgent = total < 5 * 60 * 1000; // < 5 minutes
    const isWarning = total < 15 * 60 * 1000; // < 15 minutes

    let dotColor, textColor, bgColor, borderColor, pulseClass;

    if (variant === 'payment') {
        // Amber theme for payment deadline
        dotColor   = isUrgent ? 'bg-red-400'    : 'bg-amber-400';
        textColor  = isUrgent ? 'text-red-400'  : 'text-amber-400';
        bgColor    = isUrgent ? 'bg-red-500/10' : 'bg-amber-500/10';
        borderColor = isUrgent ? 'border-red-500/25' : 'border-amber-500/25';
        pulseClass = isUrgent ? 'animate-pulse' : '';
    } else {
        // Purple/green theme for active session
        if (isUrgent) {
            dotColor    = 'bg-red-400';
            textColor   = 'text-red-400';
            bgColor     = 'bg-red-500/10';
            borderColor = 'border-red-500/25';
            pulseClass  = 'animate-pulse';
        } else if (isWarning) {
            dotColor    = 'bg-amber-400';
            textColor   = 'text-amber-400';
            bgColor     = 'bg-amber-500/10';
            borderColor = 'border-amber-500/25';
            pulseClass  = '';
        } else {
            dotColor    = 'bg-purple-400';
            textColor   = 'text-purple-300';
            bgColor     = 'bg-purple-500/10';
            borderColor = 'border-purple-500/25';
            pulseClass  = '';
        }
    }

    // ── Format: show hours only if > 0 ────────────────────────────────────
    const pad = (n) => String(n).padStart(2, '0');
    const timeStr = h > 0
        ? `${pad(h)}:${pad(m)}:${pad(s)}`
        : `${pad(m)}:${pad(s)}`;

    const unitLabel = h > 0 ? 'jj:mm:dd' : 'mm:dd';

    return (
        <div className={`inline-flex flex-col gap-0.5 ${pulseClass}`}>
            <div className={`inline-flex items-center gap-1.5 ${bgColor} border ${borderColor} rounded-lg px-2.5 py-1.5`}>
                {/* Live dot */}
                <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0 ${isUrgent ? '' : 'animate-pulse'}`} />
                {/* Time digits */}
                <span className={`font-mono font-bold text-sm tracking-widest ${textColor}`}>
                    {timeStr}
                </span>
            </div>
            {/* Unit label below */}
            <span className="text-[9px] text-gray-600 font-medium tracking-widest text-center px-1">
                {unitLabel}
            </span>
        </div>
    );
}
