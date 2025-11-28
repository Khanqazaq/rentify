// ========== EVENT HANDLERS - Централизованная обработка событий ==========

document.addEventListener('DOMContentLoaded', function() {
    
    // ========== ЯЗЫКОВЫЕ КНОПКИ ==========
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = btn.getAttribute('data-lang') || 
                        (btn.textContent.includes('🇰🇿') ? 'kk' : 'ru');
            if (typeof changeLanguage === 'function') {
                changeLanguage(lang);
            }
        });
    });
    
    // ========== КНОПКА МЕНЮ ==========
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof toggleMenu === 'function') {
                toggleMenu();
            }
        });
    }
    
    // ========== КНОПКИ ДОБАВЛЕНИЯ ВЕЩИ ==========
    const addItemButtons = document.querySelectorAll('[data-action="add-item"]');
    addItemButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof openAddModalOrLogin === 'function') {
                openAddModalOrLogin(e);
            } else if (typeof openAddModal === 'function') {
                openAddModal(e);
            }
        });
    });
    
    // ========== МОДАЛЬНЫЕ ОКНА ИНФОРМАЦИИ ==========
    const infoModalLinks = document.querySelectorAll('[data-info-modal]');
    infoModalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const type = link.getAttribute('data-info-modal');
            if (typeof openInfoModal === 'function') {
                openInfoModal(type, e);
            }
        });
    });
    
    // ========== КНОПКА "ЗАРАБОТАТЬ" ==========
    const earnButton = document.getElementById('earn-btn-2025');
    if (earnButton) {
        earnButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof openAddModalOrLogin === 'function') {
                openAddModalOrLogin(e);
            }
        });
    }
    
    // ========== СОЦИАЛЬНЫЕ ССЫЛКИ (accessibility) ==========
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        // Добавляем aria-label если его нет
        if (!link.hasAttribute('aria-label')) {
            const icon = link.querySelector('i');
            if (icon) {
                const iconClass = icon.className;
                let label = 'Social media';
                if (iconClass.includes('instagram')) label = 'Instagram';
                else if (iconClass.includes('telegram')) label = 'Telegram';
                else if (iconClass.includes('whatsapp')) label = 'WhatsApp';
                link.setAttribute('aria-label', label);
            }
        }
    });
    
    // ========== ПЛАВНЫЙ СКРОЛЛ К ЯКОРЯМ ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || !href) return;
            
            const targetElement = document.querySelector(href);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // ========== RIPPLE ЭФФЕКТ ДЛЯ КНОПОК ==========
    function createRipple(event) {
        const button = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
        circle.classList.add('ripple');
        
        const ripple = button.getElementsByClassName('ripple')[0];
        if (ripple) {
            ripple.remove();
        }
        
        button.appendChild(circle);
    }
    
    const rippleButtons = document.querySelectorAll('.btn');
    rippleButtons.forEach(btn => {
        btn.addEventListener('click', createRipple);
    });
    
    console.log('✅ Event handlers initialized');
});

// ========== LOADER UTILITIES ==========

/**
 * Показать индикатор загрузки
 * @param {string} containerId - ID контейнера
 */
function showLoader(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; padding: 4rem 0;">
            <div class="spinner"></div>
        </div>
    `;
}

/**
 * Скрыть индикатор загрузки
 * @param {string} containerId - ID контейнера
 */
function hideLoader(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    // Не очищаем, просто скрываем loader
}

/**
 * Показать сообщение об ошибке
 * @param {string} containerId - ID контейнера
 * @param {string} message - Текст ошибки
 */
function showError(containerId, message = 'Ошибка загрузки. Попробуйте обновить страницу.') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: #ef4444; background: #fef2f2; border-radius: 12px; margin: 2rem 0;">
            <i class="fas fa-exclamation-circle" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.8;"></i>
            <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">❌ Ошибка</p>
            <p style="font-size: 0.9rem; color: #991b1b;">${escapeHTML(message)}</p>
            <button onclick="location.reload()" class="btn" style="margin-top: 1rem; background: #ef4444;">
                Обновить страницу
            </button>
        </div>
    `;
}
