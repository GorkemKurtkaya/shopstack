

const attemptStore = new Map();

const safeLower = (value) => {
    if (typeof value !== "string") return "";
    return value.toLowerCase();
};

export const loginRateLimiter = (req, res, next) => {

    const WINDOW_MS = 15 * 60 * 1000;
    const MAX_ATTEMPTS = 10;

    if (req.method !== "POST") return next();

    const now = Date.now();
    const email = safeLower(req?.body?.email);
    const key = `${req.ip || req.connection?.remoteAddress || "unknown"}:${email}`;

    let entry = attemptStore.get(key);
    if (!entry || now - entry.firstAttemptMs > WINDOW_MS) {
        entry = { count: 0, firstAttemptMs: now };
    }

    entry.count += 1;
    attemptStore.set(key, entry);

    const remaining = Math.max(0, MAX_ATTEMPTS - entry.count);
    const resetAtMs = entry.firstAttemptMs + WINDOW_MS;
    const retryAfterSec = Math.max(0, Math.ceil((resetAtMs - now) / 1000));

    res.setHeader("X-RateLimit-Limit", String(MAX_ATTEMPTS));
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    res.setHeader("X-RateLimit-Reset", String(Math.floor(resetAtMs / 1000)));

    if (entry.count > MAX_ATTEMPTS) {
        if (retryAfterSec > 0) {
            res.setHeader("Retry-After", String(retryAfterSec));
        }
        return res.status(429).json({
            message: "Çok fazla giriş denemesi. Lütfen biraz bekledikten sonra tekrar deneyiniz.",
        });
    }

    res.on("finish", () => {
        if (res.statusCode === 200) {
            attemptStore.delete(key);
        }
    });

    next();
};

export default {
    loginRateLimiter,
};


