// Server-side product list. These are the ONLY prices used at checkout:
// whatever the browser sends, customers are charged the price in this file.
// If you change a price or add a product on the website (public/index.html),
// change it here too. Prices are in pence (12000 = £120.00).
const PRODUCTS = Object.freeze({
    p1: {
        name: 'Relaxed Fit Trench Coat',
        pricePence: 12000,
        img: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=600',
    },
    p2: {
        name: 'Classic Leather Biker Jacket',
        pricePence: 24000,
        img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600',
    },
    p3: {
        name: 'Minimalist Knit Sweater',
        pricePence: 8500,
        img: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&q=80&w=600',
    },
    p4: {
        name: 'Silk Slip Evening Dress',
        pricePence: 16000,
        img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600',
    },
});

module.exports = PRODUCTS;
