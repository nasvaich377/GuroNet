document.addEventListener('DOMContentLoaded', () => {
    // Элементы DOM
    const adsGrid = document.getElementById('adsGrid');
    const noAdsMessage = document.getElementById('noAdsMessage');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    const adForm = document.getElementById('adForm');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const categoryItems = document.querySelectorAll('.category-item');

    // Состояние приложения
    let currentCategory = 'all';
    let currentSearchQuery = '';

    // Инициализация данных (если в localStorage пусто, добавляем тестовые)
    if (!localStorage.getItem('ads')) {
        const initialAds = [
            { id: 1, title: 'iPhone 13 Pro', price: 75000, category: 'electronics', desc: 'Отличное состояние, полный комплект.', image: 'https://avatars.mds.yandex.net/i?id=6360b56987daac065760c9fe33da89c000de0268-4568831-images-thumbs&n=13' },
            { id: 2, title: 'iPhone 12 Pro', price: 25000, category: 'clothes', desc: 'Теплая, размер M, носилась один сезон.', image: 'https://avatars.mds.yandex.net/i?id=7f4a93762707cca10d47b3952e9bd959d9503306-4236774-images-thumbs&n=13' }
        ];
        localStorage.setItem('ads', JSON.stringify(initialAds));
    }

    // Функции
    function getAds() {
        return JSON.parse(localStorage.getItem('ads')) || [];
    }

    function saveAds(ads) {
        localStorage.setItem('ads', JSON.stringify(ads));
    }

    function renderAds() {
        const ads = getAds();
        const filteredAds = ads.filter(ad => {
            const matchesCategory = currentCategory === 'all' || ad.category === currentCategory;
            const matchesSearch = ad.title.toLowerCase().includes(currentSearchQuery.toLowerCase()) || 
                                  ad.desc.toLowerCase().includes(currentSearchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        adsGrid.innerHTML = '';
        
        if (filteredAds.length === 0) {
            noAdsMessage.classList.remove('hidden');
        } else {
            noAdsMessage.classList.add('hidden');
            filteredAds.forEach(ad => {
                const card = document.createElement('div');
                card.className = 'ad-card';
                card.innerHTML = `
                    <img src="${ad.image || 'https://via.placeholder.com/300x200/1e1e1e/e53935?text=No+Image'}" alt="${ad.title}">
                    <div class="ad-card-body">
                        <h3 class="ad-card-title">${ad.title}</h3>
                        <p class="ad-card-price">${ad.price.toLocaleString('ru-RU')} ₽</p>
                        <p class="ad-card-desc">${ad.desc}</p>
                    </div>
                `;
                adsGrid.appendChild(card);
            });
        }
    }

    // Обработчики событий
    openModalBtn.addEventListener('click', () => {
        modalOverlay.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        modalOverlay.classList.add('hidden');
        adForm.reset();
    });

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.add('hidden');
            adForm.reset();
        }
    });

    adForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const ads = getAds();
        const newAd = {
            id: Date.now(),
            title: document.getElementById('adTitle').value,
            price: parseInt(document.getElementById('adPrice').value),
            category: document.getElementById('adCategory').value,
            desc: document.getElementById('adDesc').value,
            image: document.getElementById('adImage').value
        };
        ads.unshift(newAd);
        saveAds(ads);
        renderAds();
        modalOverlay.classList.add('hidden');
        adForm.reset();
    });

    searchBtn.addEventListener('click', () => {
        currentSearchQuery = searchInput.value;
        renderAds();
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentSearchQuery = searchInput.value;
            renderAds();
        }
    });

    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            categoryItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            currentCategory = item.dataset.category;
            renderAds();
        });
    });

    // Первичный рендер
    renderAds();
});
