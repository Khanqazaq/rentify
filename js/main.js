// ========== МОКОВЫЕ ДАННЫЕ ==========
const mockItems = [
    {
        id: 1,
        title: 'Canon EOS R6 - Профессиональная камера',
        image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400',
        city: 'Алматы',
        price: 15000,
        rating: 4.8,
        reviews: 12
    },
    {
        id: 2,
        title: 'MacBook Pro 14" M2',
        image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
        city: 'Алматы',
        price: 12000,
        rating: 4.9,
        reviews: 8
    },
    {
        id: 3,
        title: 'Горный велосипед GT Avalanche',
        image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400',
        city: 'Астана',
        price: 5000,
        rating: 4.7,
        reviews: 15
    },
    {
        id: 4,
        title: 'Набор профессиональных инструментов',
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
        city: 'Алматы',
        price: 8000,
        rating: 4.6,
        reviews: 20
    }
];

// ========== ПОКАЗАТЬ ВЕЩИ ==========
function displayItems(items, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = items.map(item => `
        <a href="item-detail.html?id=${item.id}" class="item-card">
            <img src="${item.image}" alt="${item.title}" class="item-image" onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'">
            <div class="item-info">
                <h3 class="item-title">${item.title}</h3>
                <div class="item-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${item.city}
                </div>
                <div class="item-footer">
                    <div class="item-rating">
                        <i class="fas fa-star" style="color: #fbbf24;"></i>
                        <span>${item.rating}</span>
                        <span style="color: var(--gray-600);">(${item.reviews})</span>
                    </div>
                    <div class="item-price">
                        ${item.price.toLocaleString()} ₸<span style="font-size: 0.875rem; font-weight: normal; color: var(--gray-600);">/день</span>
                    </div>
                </div>
            </div>
        </a>
    `).join('');
}

// ========== ПОИСК ==========
function searchItems() {
    const searchQuery = document.getElementById('searchBox')?.value.toLowerCase() || '';
    const city = document.getElementById('cityBox')?.value.toLowerCase() || '';
    
    let filtered = mockItems;
    
    if (searchQuery) {
        filtered = filtered.filter(item => 
            item.title.toLowerCase().includes(searchQuery)
        );
    }
    
    if (city) {
        filtered = filtered.filter(item => 
            item.city.toLowerCase().includes(city)
        );
    }
    
    window.location.href = `items.html?q=${encodeURIComponent(searchQuery)}&city=${encodeURIComponent(city)}`;
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
        displayItems(mockItems.slice(0, 4), 'featuredItems');
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


