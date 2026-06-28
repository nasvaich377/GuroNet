document.addEventListener('DOMContentLoaded', () => {
    // DOM элементы
    const productsGrid = document.getElementById('productsGrid');
    const noProductsMessage = document.getElementById('noProductsMessage');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    const productForm = document.getElementById('productForm');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const categoryItems = document.querySelectorAll('.category-item');
    const cartBtn = document.getElementById('cartBtn');
    const cartCount = document.getElementById('cartCount');
    const cartModalOverlay = document.getElementById('cartModalOverlay');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // Состояние
    let currentCategory = 'all';
    let currentSearchQuery = '';
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Инициализация товаров
    if (!localStorage.getItem('products')) {
        const initialProducts = [
            { id: 1, title: 'iPhone 15 Pro Max', price: 129990, category: 'smartphones', desc: '256GB, Titanium, A17 Pro', image: 'https://via.placeholder.com/300x200/1a1a2e/00f0ff?text=iPhone+15' },
            { id: 2, title: 'MacBook Pro 16"', price: 249990, category: 'laptops', desc: 'M3 Pro, 18GB RAM, 512GB SSD', image: 'https://via.placeholder.com/300x200/1a1a2e/b829ff?text=MacBook' },
            { id: 3, title: 'AirPods Pro 2', price: 24990, category: 'audio', desc: 'Активное шумоподавление, USB-C', image: 'https://via.placeholder.com/300x200/1a1a2e/ff006e?text=AirPods' },
            { id: 4, title: 'Apple Watch Ultra 2', price: 79990, category: 'wearables', desc: '49mm, Titanium, GPS + Cellular', image: 'https://via.placeholder.com/300x200/1a1a2e/00ff88?text=Apple+Watch' },
            { id: 5, title: 'PlayStation 5', price: 54990, category: 'gaming', desc: 'Slim, 1TB SSD, DualSense', image: 'https://via.placeholder.com/300x200/1a1a2e/00f0ff?text=PS5' },
            { id: 6, title: 'Samsung Galaxy S24 Ultra', price: 119990, category: 'smartphones', desc: '512GB, Titanium Gray, S Pen', image: 'https://via.placeholder.com/300x200/1a1a2e/b829ff?text=Galaxy+S24' },
            { id: 7, title: 'Sony WH-1000XM5', price: 34990, category: 'audio', desc: 'Беспроводные, шумоподавление', image: 'https://via.placeholder.com/300x200/1a1a2e/ff006e?text=Sony+XM5' },
            { id: 8, title: 'Nintendo Switch OLED', price: 34990, category: 'gaming', desc: '7" OLED экран, 64GB', image: 'https://via.placeholder.com/300x200/1a1a2e/00ff88?text=Switch+OLED' }
        ];
        localStorage.setItem('products', JSON.stringify(initialProducts));
    }

    // Функции
    function getProducts() {
        return JSON.parse(localStorage.getItem('products')) || [];
    }

    function saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products));
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }

    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    function renderProducts() {
        const products = getProducts();
        const filteredProducts = products.filter(product => {
            const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
            const matchesSearch = product.title.toLowerCase().includes(currentSearchQuery.toLowerCase()) || 
                                  product.desc.toLowerCase().includes(currentSearchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        productsGrid.innerHTML = '';
        
        if (filteredProducts.length === 0) {
            noProductsMessage.classList.remove('hidden');
        } else {
            noProductsMessage.classList.add('hidden');
            filteredProducts.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
                    <img src="${product.image || 'https://via.placeholder.com/300x200/1a1a2e/00f0ff?text=No+Image'}" alt="${product.title}">
                    <div class="product-card-body">
                        <h3 class="product-card-title">${product.title}</h3>
                        <p class="product-card-price">${product.price.toLocaleString('ru-RU')} ₽</p>
                        <p class="product-card-desc">${product.desc}</p>
                        <button class="btn-add-cart" data-id="${product.id}">В корзину</button>
                    </div>
                `;
                productsGrid.appendChild(card);
            });

            // Добавление обработчиков для кнопок "В корзину"
            document.querySelectorAll('.btn-add-cart').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const productId = parseInt(e.target.dataset.id);
                    addToCart(productId);
                });
            });
        }
    }

    function addToCart(productId) {
        const products = getProducts();
        const product = products.find(p => p.id === productId);
        
        if (product) {
            const existingItem = cart.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({ ...product, quantity: 1 });
            }
            saveCart();
            showNotification(`"${product.title}" добавлен в корзину`);
        }
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        renderCart();
    }

    function renderCart() {
        cartItems.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Корзина пуста</p>';
        } else {
            cart.forEach(item => {
                total += item.price * item.quantity;
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-price">${item.price.toLocaleString('ru-RU')} ₽ × ${item.quantity}</div>
                    </div>
                    <button class="btn-remove" data-id="${item.id}">Удалить</button>
                `;
                cartItems.appendChild(cartItem);
            });

            document.querySelectorAll('.btn-remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const productId = parseInt(e.target.dataset.id);
                    removeFromCart(productId);
                });
            });
        }

        cartTotal.innerHTML = `Итого: <span>${total.toLocaleString('ru-RU')} ₽</span>`;
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--gradient-primary);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: var(--glow-blue);
            z-index: 2000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // Обработчики событий
    openModalBtn.addEventListener('click', () => {
        modalOverlay.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        modalOverlay.classList.add('hidden');
        productForm.reset();
    });

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.add('hidden');
            productForm.reset();
        }
    });

    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const products = getProducts();
        const newProduct = {
            id: Date.now(),
            title: document.getElementById('prodTitle').value,
            price: parseInt(document.getElementById('prodPrice').value),
            category: document.getElementById('prodCategory').value,
            desc: document.getElementById('prodDesc').value,
            image: document.getElementById('prodImage').value
        };
        products.unshift(newProduct);
        saveProducts(products);
        renderProducts();
        modalOverlay.classList.add('hidden');
        productForm.reset();
        showNotification('Товар успешно добавлен!');
    });

    searchBtn.addEventListener('click', () => {
        currentSearchQuery = searchInput.value;
        renderProducts();
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentSearchQuery = searchInput.value;
            renderProducts();
        }
    });

    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            categoryItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            currentCategory = item.dataset.category;
            renderProducts();
        });
    });

    cartBtn.addEventListener('click', () => {
        renderCart();
        cartModalOverlay.classList.remove('hidden');
    });

    closeCartBtn.addEventListener('click', () => {
        cartModalOverlay.classList.add('hidden');
    });

    cartModalOverlay.addEventListener('click', (e) => {
        if (e.target === cartModalOverlay) {
            cartModalOverlay.classList.add('hidden');
        }
    });

    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showNotification('Корзина пуста!');
            return;
        }
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        showNotification(`Заказ оформлен! Сумма: ${total.toLocaleString('ru-RU')} ₽`);
        cart = [];
        saveCart();
        cartModalOverlay.classList.add('hidden');
    });

    // Добавление анимаций
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Первичный рендер
    renderProducts();
    updateCartCount();
});
