// ========== МОКОВЫЕ ДАННЫЕ ==========
const mockItems = [
    {
        id: 1,
        name: 'Canon EOS R6 - Профессиональная камера',
        title: 'Canon EOS R6 - Профессиональная камера',
        description: 'Профессиональная беззеркальная камера в отличном состоянии. Идеально подходит для фото и видеосъёмки.',
        image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400',
        images: ['https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400'],
        city: 'Алматы',
        price: 15000,
        rating: 4.8,
        reviews: 12,
        category: 'electronics',
        subcategory: 'cameras',
        ownerName: 'Айдар',
        ownerPhone: '+77011234567'
    },
    {
        id: 2,
        name: 'MacBook Pro 14" M2',
        title: 'MacBook Pro 14" M2',
        description: 'Мощный ноутбук для работы и творчества. 16GB RAM, 512GB SSD. Состояние как новое.',
        image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
        images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400'],
        city: 'Алматы',
        price: 12000,
        rating: 4.9,
        reviews: 8,
        category: 'electronics',
        subcategory: 'computers',
        ownerName: 'Анара',
        ownerPhone: '+77027654321'
    },
    {
        id: 3,
        name: 'Горный велосипед GT Avalanche',
        title: 'Горный велосипед GT Avalanche',
        description: 'Отличный горный велосипед для катания по городу и трейлам. Размер рамы M.',
        image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400',
        images: ['https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400'],
        city: 'Астана',
        price: 5000,
        rating: 4.7,
        reviews: 15,
        category: 'sports',
        subcategory: 'bicycles',
        ownerName: 'Ерлан',
        ownerPhone: '+77051112233'
    },
    {
        id: 4,
        name: 'Набор профессиональных инструментов',
        title: 'Набор профессиональных инструментов',
        description: 'Полный набор электро и ручных инструментов. Дрель, шуруповерт, болгарка и многое другое.',
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
        images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'],
        city: 'Алматы',
        price: 8000,
        rating: 4.6,
        reviews: 20,
        category: 'tools',
        subcategory: 'power',
        ownerName: 'Марат',
        ownerPhone: '+77013334455'
    }
];

// ========== ПОКАЗАТЬ ВЕЩИ ==========
function displayItems(items, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Проверяем наличие функции sanitizeItem (из sanitizer.js)
    const sanitize = typeof sanitizeItem === 'function' ? sanitizeItem : (item) => item;
    const sanitizeURL = typeof sanitizeImageURL === 'function' ? sanitizeImageURL : (url) => url;
    
    container.innerHTML = items.map(item => {
        const safe = sanitize(item);
        const imageUrl = sanitizeURL(item.images && item.images[0] ? item.images[0] : item.image);
        
        return `
        <div class="item-card" itemscope itemtype="https://schema.org/Product" style="position: relative;">
            <meta itemprop="name" content="${safe.name || safe.title}">
            <meta itemprop="description" content="${safe.description || ''}">
            <link itemprop="image" href="${imageUrl}">
            
            <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
                <meta itemprop="price" content="${item.price || 0}">
                <meta itemprop="priceCurrency" content="KZT">
                <meta itemprop="availability" content="https://schema.org/InStock">
            </div>
            
            <div itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating">
                <meta itemprop="ratingValue" content="${item.rating || 4.5}">
                <meta itemprop="reviewCount" content="${item.reviews || 0}">
            </div>
            
            <button class="favorite-btn" data-item-id="${item.id}" 
                    style="position: absolute; top: 10px; right: 10px; background: white; border: none; border-radius: 50%; 
                           width: 44px; height: 44px; min-width: 44px; min-height: 44px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.15); 
                           display: flex; align-items: center; justify-content: center; z-index: 10; transition: transform 0.2s;">
                <i class="${isFavorite(item.id) ? 'fas' : 'far'} fa-heart" style="color: ${isFavorite(item.id) ? '#ef4444' : '#6b7280'}; font-size: 1.1rem;"></i>
            </button>
            <div class="item-clickable" data-item-id="${item.id}" style="cursor:pointer;">
                <img src="${imageUrl}" 
                     alt="${safe.name || safe.title}" 
                     class="item-image" 
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'">
                <div class="item-info">
                    <h3 class="item-title" itemprop="name">${safe.name || safe.title}</h3>
                    <div class="item-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span itemprop="availableAtOrFrom">${safe.city || 'Не указан'}</span>
                    </div>
                    <div class="item-footer">
                        <div class="item-rating">
                            <i class="fas fa-star" style="color: #fbbf24;"></i>
                            <span>${item.rating || 4.5}</span>
                            <span style="color: var(--gray-600);">(${item.reviews || 0})</span>
                        </div>
                        <div class="item-price">
                            ${(item.price || 0).toLocaleString()} ₸<span style="font-size: 0.875rem; font-weight: normal; color: var(--gray-600);">/день</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    // Добавляем обработчики событий после рендера (безопасно, без inline onclick)
    container.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const itemId = parseInt(btn.getAttribute('data-item-id'));
            toggleFavorite(itemId);
        });
    });
    
    container.querySelectorAll('.item-clickable').forEach(div => {
        div.addEventListener('click', () => {
            const itemId = parseInt(div.getAttribute('data-item-id'));
            if (typeof openItemDetail === 'function') {
                openItemDetail(itemId);
            }
        });
    });
}

// ========== ПОИСК И ФИЛЬТРАЦИЯ ==========
function searchItems() {
    const searchQuery = document.getElementById('searchBox')?.value.toLowerCase() || '';
    const city = document.getElementById('cityBox')?.value.toLowerCase() || '';
    
    let filtered = getAllItems();
    
    if (searchQuery) {
        filtered = filtered.filter(item => 
            (item.title || item.name || '').toLowerCase().includes(searchQuery) ||
            (item.description || '').toLowerCase().includes(searchQuery)
        );
    }
    
    if (city) {
        filtered = filtered.filter(item => 
            (item.city || '').toLowerCase().includes(city)
        );
    }
    
    window.location.href = `items.html?q=${encodeURIComponent(searchQuery)}&city=${encodeURIComponent(city)}`;
}

// Получить все вещи (mock + localStorage)
function getAllItems() {
    try {
        const stored = JSON.parse(localStorage.getItem('userItems') || '[]');
        return [...mockItems, ...stored];
    } catch (e) {
        return mockItems;
    }
}

// Фильтровать по категории
function filterByCategory(category) {
    const items = getAllItems();
    return category ? items.filter(item => item.category === category) : items;
}

// Фильтровать по цене
function filterByPrice(items, minPrice, maxPrice) {
    if (!minPrice && !maxPrice) return items;
    return items.filter(item => {
        const price = item.price || 0;
        if (minPrice && price < minPrice) return false;
        if (maxPrice && price > maxPrice) return false;
        return true;
    });
}

// Полнотекстовый поиск
function searchItemsFull(query, category = '', minPrice = null, maxPrice = null) {
    let items = getAllItems();
    
    // Фильтр по категории
    if (category) {
        items = items.filter(item => item.category === category);
    }
    
    // Фильтр по цене
    items = filterByPrice(items, minPrice, maxPrice);
    
    // Текстовый поиск
    if (query) {
        const q = query.toLowerCase();
        items = items.filter(item => 
            (item.title || item.name || '').toLowerCase().includes(q) ||
            (item.description || '').toLowerCase().includes(q) ||
            (item.city || '').toLowerCase().includes(q)
        );
    }
    
    return items;
}

// ========== МОБИЛЬНОЕ МЕНЮ ==========
function toggleMenu() {
    const menu = document.querySelector('.nav-menu');
    menu.classList.toggle('active');
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', function() {
    // Показать рекомендуемые вещи на главной
    if (document.getElementById('featuredItems')) {
        displayItems(getAllItems().slice(0, 8), 'featuredItems');
    }
    
    // Обработка Enter в поиске
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchItems();
            }
        });
    }
    
    const searchBox = document.getElementById('searchBox');
    if (searchBox) {
        searchBox.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchItems();
            }
        });
    }
    
    // Обновить navbar для залогиненных пользователей
    updateNavbar();
    
    // Закрыть меню при клике вне его
    document.addEventListener('click', function(e) {
        const menu = document.querySelector('.nav-menu');
        const toggle = document.querySelector('.menu-toggle');
        if (menu && !menu.contains(e.target) && !toggle.contains(e.target)) {
            menu.classList.remove('active');
        }
    });
});

// Сохранить элементы в localStorage для использования на других страницах
if (typeof Storage !== 'undefined') {
    localStorage.setItem('mockItems', JSON.stringify(mockItems));
}

// ========== УПРАВЛЕНИЕ ПРОФИЛЕМ И ОБЪЯВЛЕНИЯМИ ==========

// Обновить navbar для залогиненного пользователя
function updateNavbar() {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const loginBtn = document.getElementById('loginBtn');
    const profileBtn = document.getElementById('profileBtn');
    
    if (user && loginBtn && profileBtn) {
        loginBtn.style.display = 'none';
        profileBtn.style.display = 'inline-block';
        profileBtn.textContent = user.name || user.phone || 'Профиль';
    } else if (!user && loginBtn && profileBtn) {
        loginBtn.style.display = 'inline-block';
        profileBtn.style.display = 'none';
    }
}

// Получить объявления текущего пользователя
function getUserItems() {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!user) return [];
    
    try {
        const allItems = JSON.parse(localStorage.getItem('userItems') || '[]');
        return allItems.filter(item => item.ownerPhone === user.phone);
    } catch (e) {
        return [];
    }
}

// Удалить объявление
function deleteItem(itemId) {
    if (!confirm('Вы уверены, что хотите удалить это объявление?')) return;
    
    try {
        const allItems = JSON.parse(localStorage.getItem('userItems') || '[]');
        const filtered = allItems.filter(item => item.id !== itemId);
        localStorage.setItem('userItems', JSON.stringify(filtered));
        
        if (typeof showNotification === 'function') {
            showNotification('Объявление успешно удалено', 'success');
        }
        
        // Перезагрузить страницу профиля
        if (window.location.pathname.includes('profile.html')) {
            setTimeout(() => window.location.reload(), 500);
        }
    } catch (e) {
        if (typeof showNotification === 'function') {
            showNotification('Ошибка при удалении', 'error');
        }
    }
}

// Редактировать объявление
function editItem(itemId) {
    try {
        const allItems = JSON.parse(localStorage.getItem('userItems') || '[]');
        const item = allItems.find(i => i.id === itemId);
        
        if (!item) {
            alert('Объявление не найдено');
            return;
        }
        
        // Открываем модальное окно добавления в режиме редактирования
        const overlay = document.getElementById('add-overlay');
        if (!overlay) return;
        
        overlay.style.display = 'flex';
        
        // Заполняем форму данными объявления
        document.getElementById('add-title').value = item.title || item.name || '';
        document.getElementById('add-description').value = item.description || '';
        document.getElementById('add-price').value = item.price || '';
        document.getElementById('add-city').value = item.city || '';
        document.getElementById('add-category').value = item.category || '';
        
        // Меняем заголовок и кнопку
        const modalTitle = overlay.querySelector('h2');
        const submitBtn = overlay.querySelector('button[type="button"]');
        
        if (modalTitle) modalTitle.textContent = 'Редактировать объявление';
        if (submitBtn) {
            submitBtn.textContent = 'Сохранить изменения';
            submitBtn.onclick = function() {
                updateItem(itemId);
            };
        }
    } catch (e) {
        alert('Ошибка при загрузке объявления');
    }
}

// Обновить объявление
function updateItem(itemId) {
    try {
        const allItems = JSON.parse(localStorage.getItem('userItems') || '[]');
        const itemIndex = allItems.findIndex(i => i.id === itemId);
        
        if (itemIndex === -1) {
            alert('Объявление не найдено');
            return;
        }
        
        // Собираем обновленные данные
        allItems[itemIndex] = {
            ...allItems[itemIndex],
            title: document.getElementById('add-title').value,
            name: document.getElementById('add-title').value,
            description: document.getElementById('add-description').value,
            price: parseInt(document.getElementById('add-price').value) || 0,
            city: document.getElementById('add-city').value,
            category: document.getElementById('add-category').value
        };
        
        localStorage.setItem('userItems', JSON.stringify(allItems));
        
        if (typeof showNotification === 'function') {
            showNotification('Объявление успешно обновлено', 'success');
        }
        
        // Закрываем модалку и перезагружаем
        document.getElementById('add-overlay').style.display = 'none';
        setTimeout(() => window.location.reload(), 500);
        
    } catch (e) {
        if (typeof showNotification === 'function') {
            showNotification('Ошибка при обновлении', 'error');
        }
    }
}

// Добавить в избранное
function toggleFavorite(itemId) {
    try {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const index = favorites.indexOf(itemId);
        
        if (index > -1) {
            favorites.splice(index, 1);
            if (typeof showNotification === 'function') {
                showNotification('Удалено из избранного', 'info');
            }
        } else {
            favorites.push(itemId);
            if (typeof showNotification === 'function') {
                showNotification('Добавлено в избранное', 'success');
            }
        }
        
        localStorage.setItem('favorites', JSON.stringify(favorites));
        
        // Обновляем иконку
        const btn = document.querySelector(`[data-item-id="${itemId}"]`);
        if (btn) {
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = (index > -1) ? 'far fa-heart' : 'fas fa-heart';
                icon.style.color = (index > -1) ? '#6b7280' : '#ef4444';
            }
        }
        
        // Если мы на странице избранного, перезагружаем
        if (window.location.pathname.includes('profile.html')) {
            setTimeout(() => {
                if (typeof loadFavorites === 'function') loadFavorites();
            }, 300);
        }
    } catch (e) {
        console.error('Favorite toggle error:', e);
    }
}

// Получить избранное
function getFavoriteItems() {
    try {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const allItems = getAllItems();
        return allItems.filter(item => favorites.includes(item.id));
    } catch (e) {
        return [];
    }
}

// Проверить, в избранном ли
function isFavorite(itemId) {
    try {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        return favorites.includes(itemId);
    } catch (e) {
        return false;
    }
}

// ========== CHAT WIDGET (ROLE + ITEM BOUND, LOCAL SIMULATION) ==========
(function(){
    function qs(id){ return document.getElementById(id); }

    function convKey(itemId){ return 'chat_' + (itemId ? String(itemId) : 'global'); }

    function loadMessages(itemId){
        try{ return JSON.parse(localStorage.getItem(convKey(itemId)) || '[]'); }catch(e){ return []; }
    }

    function saveMessages(itemId, arr){ try{ localStorage.setItem(convKey(itemId), JSON.stringify(arr)); }catch(e){} }

    function formatTime(ts){ const d = new Date(ts); return d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0'); }

    function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    function getCurrentRole(){ return qs('chatRole') ? qs('chatRole').value : 'renter'; }
    function getCurrentItemId(){ return (qs('chatItemId') && qs('chatItemId').value.trim()) || 'global'; }

    function renderMessages(){
        const box = qs('chatMessages'); if(!box) return;
        const itemId = getCurrentItemId();
        const currentRole = getCurrentRole();
        const messages = loadMessages(itemId);
        box.innerHTML = '';
        messages.forEach(msg =>{
            const el = document.createElement('div');
            const isMe = (msg.senderRole === currentRole);
            el.className = 'chat-msg ' + (isMe ? 'me' : 'other');
            const label = msg.senderRole === 'owner' ? 'Арендодатель' : 'Арендатор';
            el.innerHTML = `<div style="font-weight:600; margin-bottom:6px; font-size:0.85rem;">${label}</div><div>${escapeHtml(msg.text)}</div><div style="font-size:0.72rem; opacity:0.65; margin-top:6px;">${formatTime(msg.time)}</div>`;
            box.appendChild(el);
        });
        box.scrollTop = box.scrollHeight;
    }

    function sendMessage(text){
        if(!text || !text.trim()) return;
        const itemId = getCurrentItemId();
        const role = getCurrentRole();
        const messages = loadMessages(itemId);
        const msg = { senderRole: role, text: text.trim(), time: Date.now() };
        messages.push(msg); saveMessages(itemId, messages); renderMessages();

        // simulate reply from the other side
        const otherRole = role === 'owner' ? 'renter' : 'owner';
        const replies = {
            owner: ['Спасибо, проверю и отпишусь.', 'Хорошо — когда вам удобно забрать?', 'Могу подтвердить — вещь доступна.'],
            renter: ['Спасибо, подскажите цену за сутки.', 'Можно на завтра?', 'Отлично, беру на 3 дня.']
        };
        const pool = replies[otherRole] || ['Окей, я посмотрю.'];
        const replyText = pool[Math.floor(Math.random()*pool.length)];

        setTimeout(()=>{
            const arr = loadMessages(itemId);
            arr.push({ senderRole: otherRole, text: replyText, time: Date.now() });
            saveMessages(itemId, arr); renderMessages();
        }, 900 + Math.floor(Math.random()*1300));
    }

    document.addEventListener('DOMContentLoaded', function(){
        const widget = qs('chatWidget');
        if(!widget) return;
        const toggle = qs('chatToggle');
        const panel = qs('chatPanel');
        const closeBtn = qs('chatClose');
        const sendBtn = qs('chatSend');
        const input = qs('chatInput');
        const roleSelect = qs('chatRole');
        const itemInput = qs('chatItemId');
        const openConv = qs('chatOpenConv');

        function open(){ widget.classList.add('open'); panel.style.display='flex'; setTimeout(()=>{ input && input.focus(); },100); }
        function close(){ widget.classList.remove('open'); panel.style.display='none'; }

        toggle && toggle.addEventListener('click', function(e){ e.preventDefault(); if(widget.classList.contains('open')) close(); else open(); });
        closeBtn && closeBtn.addEventListener('click', function(){ close(); });

        sendBtn && sendBtn.addEventListener('click', function(){ sendMessage(input.value); input.value=''; input.focus(); });
        input && input.addEventListener('keypress', function(e){ if(e.key === 'Enter'){ e.preventDefault(); sendBtn.click(); } });

        function openConversation(){ const id = getCurrentItemId(); renderMessages(); }

        openConv && openConv.addEventListener('click', function(){ openConversation(); open(); });
        roleSelect && roleSelect.addEventListener('change', function(){ renderMessages(); });
        itemInput && itemInput.addEventListener('keypress', function(e){ if(e.key === 'Enter'){ e.preventDefault(); openConversation(); } });

        // prefill item id with 1 when available (helpful demo)
        if(itemInput && !itemInput.value){ itemInput.value = '1'; }
        renderMessages();
    });
})();


