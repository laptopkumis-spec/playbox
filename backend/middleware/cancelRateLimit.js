/**
 * In-memory rate limiter for booking cancellation.
 *
 * Rules (per user):
 *  - Max 3 cancellations per 10-minute window
 *  - 30-second cooldown between consecutive cancel requests
 *
 * Uses a Map keyed by user ID — no external dependencies needed.
 * Note: resets on server restart. For multi-instance deployments,
 * replace with Redis-backed storage.
 */

// { userId: { count, windowStart, lastRequest } }
const cancelLog = new Map();

const WINDOW_MS      = 10 * 60 * 1000; // 10 minutes
const MAX_PER_WINDOW = 3;               // max cancellations per window
const COOLDOWN_MS    = 30 * 1000;       // 30s between requests

// Periodically clean up stale entries to prevent memory leak
setInterval(() => {
    const now = Date.now();
    for (const [userId, entry] of cancelLog.entries()) {
        if (now - entry.windowStart > WINDOW_MS) {
            cancelLog.delete(userId);
        }
    }
}, WINDOW_MS);

function cancelRateLimit(req, res, next) {
    const userId = String(req.user.id);
    const now    = Date.now();

    let entry = cancelLog.get(userId);

    // First request or window expired — reset
    if (!entry || now - entry.windowStart > WINDOW_MS) {
        entry = { count: 0, windowStart: now, lastRequest: 0 };
    }

    // Cooldown check — too soon after last cancel
    const sinceLast = now - entry.lastRequest;
    if (entry.lastRequest > 0 && sinceLast < COOLDOWN_MS) {
        const waitSec = Math.ceil((COOLDOWN_MS - sinceLast) / 1000);
        return res.status(429).json({
            message: `Terlalu cepat. Tunggu ${waitSec} detik sebelum membatalkan lagi.`,
            retry_after_seconds: waitSec,
        });
    }

    // Window limit check
    if (entry.count >= MAX_PER_WINDOW) {
        const windowResetSec = Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 1000);
        const mins = Math.ceil(windowResetSec / 60);
        return res.status(429).json({
            message: `Batas pembatalan tercapai (${MAX_PER_WINDOW}x per 10 menit). Coba lagi dalam ${mins} menit.`,
            retry_after_seconds: windowResetSec,
        });
    }

    // Allow — update counters
    entry.count++;
    entry.lastRequest = now;
    cancelLog.set(userId, entry);

    next();
}

module.exports = cancelRateLimit;
