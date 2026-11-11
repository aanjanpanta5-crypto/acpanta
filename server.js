const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.static('.'));
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
    try {
        const { items } = req.body;

        const lineItems = items.map(item => ({
            price_data: {
                currency: 'gbp',
                product_data: {
                    name: item.name,
                    images: [item.img],
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            shipping_address_collection: {
                allowed_countries: ['GB', 'US', 'CA', 'IE'],
            },
            line_items: lineItems,
            mode: 'payment',
            success_url: `${req.protocol}://${req.get('host')}/success.html`,
            cancel_url: `${req.protocol}://${req.get('host')}/cancel.html`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`ACPANTA Server running on http://localhost:${PORT}`));