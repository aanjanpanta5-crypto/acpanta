const PRODUCTS = require('./products');

const MAX_LINES = 20;
const MAX_QUANTITY = 10;

// Turns the browser's cart into Stripe line items using server-side prices.
// The browser may only choose WHICH products and HOW MANY; name, price and
// image always come from products.js. Returns { lineItems } or { error }.
function buildLineItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
        return { error: 'Your cart is empty.' };
    }
    if (items.length > MAX_LINES) {
        return { error: 'Too many different items in one order.' };
    }

    const seen = new Set();
    const lineItems = [];

    for (const item of items) {
        if (!item || typeof item !== 'object') {
            return { error: 'Your cart has an invalid item. Please refresh and try again.' };
        }
        const { id, quantity } = item;
        if (typeof id !== 'string' || !Object.hasOwn(PRODUCTS, id)) {
            return { error: 'One of the items in your cart is no longer available. Please refresh and try again.' };
        }
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
            return { error: `You can order between 1 and ${MAX_QUANTITY} of each item.` };
        }
        if (seen.has(id)) {
            return { error: 'Your cart has a duplicate item. Please refresh and try again.' };
        }
        seen.add(id);

        const product = PRODUCTS[id];
        lineItems.push({
            price_data: {
                currency: 'gbp',
                product_data: {
                    name: product.name,
                    images: [product.img],
                },
                unit_amount: product.pricePence,
            },
            quantity,
        });
    }

    return { lineItems };
}

module.exports = { buildLineItems, MAX_LINES, MAX_QUANTITY };
