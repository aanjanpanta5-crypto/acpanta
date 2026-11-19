# ACPANTA Fashion Store

A small online shop: web pages in `public/`, a Node.js + Express server (`server.js`), and Stripe Checkout for payments.

## Run it on your computer

1. Install Node.js 18 or newer.
2. Copy `.env.example` to `.env` and fill it in. Use a Stripe **test** key (`sk_test_...`) here.
3. Run `npm ci`, then `npm start`.
4. Open http://localhost:3000.

## Settings for the live site

Add these in your hosting dashboard (never commit a real `.env` file):

| Setting | Value |
|---|---|
| `STRIPE_SECRET_KEY` | Your Stripe **live** secret key (`sk_live_...`) |
| `BASE_URL` | Your live address, e.g. `https://www.yourdomain.com` |
| `NODE_ENV` | `production` |
| `TRUST_PROXY` | `1` (right for Render, Railway and Heroku) |

- Start command: `npm start`
- Health check path: `/healthz`

## Changing prices or products

Customers are charged the prices in `products.js` (in pence), whatever the web page shows. When you change a price or add a product in `public/index.html`, change `products.js` to match.

## Undoing a bad release

Redeploy the previous version from your host's deploy history, or revert the pull request on GitHub and let the host redeploy.

## Reporting a security problem

Email aanjan.panta5@gmail.com (also listed at `/.well-known/security.txt`).
