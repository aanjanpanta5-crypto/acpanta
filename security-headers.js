// Browser security headers for every response.
//
// The Content-Security-Policy is sent in REPORT-ONLY mode: browsers log
// anything that breaks the rules (in the developer console) but block nothing,
// so the shop can't break. Switch it to enforcing only after the console shows
// no warnings and the inline onclick handlers have been moved into scripts.
const CSP_REPORT_ONLY = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
    "font-src 'self' https://cdnjs.cloudflare.com",
    "img-src 'self' data: https://images.unsplash.com https://via.placeholder.com",
    "connect-src 'self' https://api.stripe.com",
    "frame-src https://js.stripe.com https://hooks.stripe.com https://m.stripe.network",
    "form-action 'self' https://api.web3forms.com",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
].join('; ');

function securityHeaders(req, res, next) {
    res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Content-Security-Policy-Report-Only': CSP_REPORT_ONLY,
    });
    // Tell browsers to always use HTTPS for this site (only sent over HTTPS).
    // Subdomains and browser preload lists are left out on purpose.
    if (req.secure) {
        res.set('Strict-Transport-Security', 'max-age=31536000');
    }
    next();
}

module.exports = { securityHeaders, CSP_REPORT_ONLY };
