// Load cart from localStorage
let cart = JSON.parse(localStorage.getItem('acpanta_cart')) || [];

// 1. Map products from index.html based on prices and titles
const productData = [
    { id: 'p1', name: 'Relaxed Fit Trench Coat', price: 120.00, img: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=600' },
    { id: 'p2', name: 'Classic Leather Biker Jacket', price: 240.00, img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600' },
    { id: 'p3', name: 'Minimalist Knit Sweater', price: 85.00, img: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&q=80&w=600' },
    { id: 'p4', name: 'Silk Slip Evening Dress', price: 160.00, img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600' }
];

document.addEventListener('DOMContentLoaded', () => {
    // 2. Attach click events to "Quick Add" buttons in index.html
    const quickAddButtons = document.querySelectorAll('button:has(i.fa-heart) + img + button, .group button:last-child');
    const productCards = document.querySelectorAll('.grid > .group');

    productCards.forEach((card, index) => {
        const addBtn = card.querySelector('button:last-child');
        if (addBtn && productData[index]) {
            addBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const item = productData[index];
                addToCart(item.id, item.name, item.price, item.img);
            });
        }
    });

    // 3. Attach click event to the Shopping Bag icon in header
    const cartIconBtn = document.querySelector('header button:has(i.fa-bag-shopping)');
    if (cartIconBtn) {
        cartIconBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartDrawer(true);
        });
    }

    // 4. Inject Cart Drawer into page DOM
    injectCartDrawer();
    updateCartCount();
});

function addToCart(id, name, price, img) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id, name, price, img, quantity: 1 });
    }
    localStorage.setItem('acpanta_cart', JSON.stringify(cart));
    updateCartCount();
    renderCartUI();
    toggleCartDrawer(true);
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.querySelector('header button:has(i.fa-bag-shopping) span');
    if (badge) badge.textContent = totalItems;
}

function toggleCartDrawer(open) {
    const drawer = document.getElementById('acpanta-cart-drawer');
    const overlay = document.getElementById('acpanta-cart-overlay');
    if (!drawer || !overlay) return;

    if (open) {
        overlay.classList.remove('hidden');
        drawer.classList.remove('translate-x-full');
    } else {
        overlay.classList.add('hidden');
        drawer.classList.add('translate-x-full');
    }
}

function injectCartDrawer() {
    const html = `
        <div id="acpanta-cart-overlay" onclick="toggleCartDrawer(false)" class="fixed inset-0 bg-black/50 z-50 hidden transition-opacity"></div>
        <div id="acpanta-cart-drawer" class="fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 shadow-2xl transform translate-x-full transition-transform duration-300 flex flex-col">
            <div class="p-4 border-b flex justify-between items-center bg-gray-50">
                <h2 class="text-lg font-bold">Shopping Cart</h2>
                <button onclick="toggleCartDrawer(false)" class="text-gray-500 hover:text-black p-2"><i class="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <div id="acpanta-cart-list" class="flex-1 overflow-y-auto p-4 space-y-4"></div>
            <div class="p-4 border-t bg-gray-50 space-y-3">
                <div class="flex justify-between font-bold text-lg">
                    <span>Subtotal:</span>
                    <span id="acpanta-subtotal">£0.00</span>
                </div>
                <button id="acpanta-checkout-btn" onclick="startCheckout()" class="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition">
                    Checkout Now
                </button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    renderCartUI();
}

function renderCartUI() {
    const list = document.getElementById('acpanta-cart-list');
    const subtotal = document.getElementById('acpanta-subtotal');
    if (!list || !subtotal) return;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    subtotal.textContent = `£${total.toFixed(2)}`;

    if (cart.length === 0) {
        list.innerHTML = `<div class="text-center py-10 text-gray-400">Your cart is empty</div>`;
        return;
    }

    list.innerHTML = cart.map(item => `
        <div class="flex items-center space-x-3 border-b pb-3">
            <img src="${item.img}" class="w-14 h-14 object-cover rounded">
            <div class="flex-1">
                <h4 class="text-sm font-medium">${item.name}</h4>
                <p class="text-xs text-gray-500">£${item.price.toFixed(2)} x ${item.quantity}</p>
            </div>
            <span class="font-bold text-sm">£${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');
}

async function startCheckout() {
    if (cart.length === 0) return alert('Your cart is empty');
    
    const btn = document.getElementById('acpanta-checkout-btn');
    btn.disabled = true;
    btn.textContent = 'Redirecting to payment...';

    try {
        const response = await fetch('/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cart })
        });

        const data = await response.json();
        if (data.url) {
            window.location.href = data.url;
        } else {
            alert('Payment creation failed.');
            btn.disabled = false;
            btn.textContent = 'Checkout Now';
        }
    } catch (err) {
        console.error(err);
        alert('Could not connect to server.');
        btn.disabled = false;
        btn.textContent = 'Checkout Now';
    }
}

// Mobile Menu Toggle Fix
    const mobileMenuBtn = document.querySelector('header button:has(i.fa-bars)');
    if (mobileMenuBtn) {
        // Create mobile navigation dropdown element dynamically
        const navMenu = document.querySelector('header nav');
        if (navMenu) {
            const mobileMenu = document.createElement('div');
            mobileMenu.className = 'hidden absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-lg flex flex-col p-6 space-y-4 lg:hidden z-50';
            mobileMenu.innerHTML = navMenu.innerHTML;
            document.querySelector('header').appendChild(mobileMenu);

            mobileMenuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                mobileMenu.classList.toggle('hidden');
            });
        }
    }
