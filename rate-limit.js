// Simple per-visitor rate limit for the checkout route.
// It keeps counts in this server's memory, so counts reset when the server
// restarts and aren't shared if you ever run more than one copy of the server.
// That is fine as a first line of defence for a single small server; for
// stronger protection add a rate-limit rule at Cloudflare or your host.
function createRateLimiter({ windowMs, max, message }) {
    const hits = new Map();

    // Forget old visitors so memory doesn't grow forever.
    const cleanup = setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of hits) {
            if (now - entry.start >= windowMs) hits.delete(key);
        }
    }, windowMs);
    cleanup.unref();

    return function rateLimit(req, res, next) {
        const now = Date.now();
        const key = req.ip || 'unknown';
        let entry = hits.get(key);

        if (!entry || now - entry.start >= windowMs) {
            entry = { start: now, count: 0 };
            hits.set(key, entry);
        }
        entry.count += 1;

        if (entry.count > max) {
            const retryAfterSeconds = Math.ceil((entry.start + windowMs - now) / 1000);
            res.set('Retry-After', String(retryAfterSeconds));
            return res.status(429).json({ error: message });
        }
        return next();
    };
}

module.exports = { createRateLimiter };
