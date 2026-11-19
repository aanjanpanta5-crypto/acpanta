const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { buildLineItems } = require('./checkout-items');
const { createRateLimiter } = require('./rate-limit');

// Your live address, e.g. https://www.acpanta.com (no slash at the end).
// Stripe sends customers back here after paying or cancelling.
const BASE_URL = (process.env.BASE_URL || '').trim().replace(/\/+$/, '');
if (BASE_URL && !/^https?:\/\/[^/\s?#]+$/i.test(BASE_URL)) {
    throw new Error('BASE_URL must be just your site address, like https://www.acpanta.com');
}
if (!BASE_URL) {
    console.warn('WARNING: BASE_URL is not set. Set it to your live address so Stripe always returns customers to your own site.');
}

const app = express();

// Hosting platforms put one proxy in front of the app. Trusting exactly one
// hop lets Express see each visitor's real IP for the checkout rate limit.
// Change with the TRUST_PROXY setting if your host is different.
const trustProxy = (process.env.TRUST_PROXY || '1').trim();
app.set('trust proxy', /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy);

// Only the public/ folder is visible to visitors. server.js, package files,
// .env and anything else in the project folder are never served.
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10kb' }));

const checkoutLimiter = createRateLimiter({
    windowMs: 10 * 60 * 1000,
    max: 10,
    message: 'Too many checkout attempts. Please wait a few minutes and try again.',
});

function siteUrl(req) {
    return BASE_URL || `${req.protocol}://${req.get('host')}`;
}

app.post('/create-checkout-session', checkoutLimiter, async (req, res) => {
    const { lineItems, error } = buildLineItems(req.body && req.body.items);
    if (error) {
        return res.status(400).json({ error });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            shipping_address_collection: {
                allowed_countries: ['GB', 'US', 'CA', 'IE'],
            },
            line_items: lineItems,
            mode: 'payment',
            success_url: `${siteUrl(req)}/success.html`,
            cancel_url: `${siteUrl(req)}/cancel.html`,
        });

        return res.json({ url: session.url });
    } catch (err) {
        console.error('Stripe checkout error:', err.type || err.name, err.message);
        return res.status(500).json({ error: 'Checkout is unavailable right now. Please try again in a moment.' });
    }
});

// Last-resort error handler: visitors never see stack traces or internal details.
app.use((err, req, res, next) => {
    const status = err.status >= 400 && err.status < 500 ? err.status : 500;
    if (status === 500) console.error('Server error:', err.message);
    res.status(status).json({
        error: status === 500 ? 'Something went wrong. Please try again.' : 'Bad request.',
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`ACPANTA Server running on http://localhost:${PORT}`));
