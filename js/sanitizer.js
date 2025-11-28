// ========== SANITIZER - Защита от XSS ==========

/**
 * Экранирует HTML специальные символы
 * @param {string} str - Строка для экранирования
 * @returns {string} Безопасная строка
 */
function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Очищает объект товара от потенциально опасных данных
 * @param {Object} item - Объект товара
 * @returns {Object} Очищенный объект
 */
function sanitizeItem(item) {
    if (!item) return {};
    
    return {
        ...item,
        name: escapeHTML(item.name),
        title: escapeHTML(item.title),
        description: escapeHTML(item.description),
        desc: escapeHTML(item.desc),
        city: escapeHTML(item.city),
        address: escapeHTML(item.address),
        ownerName: escapeHTML(item.ownerName),
        // Числа и boolean значения безопасны
        id: item.id,
        price: item.price,
        rating: item.rating,
        reviews: item.reviews,
        category: item.category,
        subcategory: item.subcategory,
        // URL и массивы изображений оставляем как есть (валидируются отдельно)
        image: item.image,
        images: item.images,
        ownerPhone: item.ownerPhone,
        phone: item.phone,
        created: item.created
    };
}

/**
 * Валидирует URL изображения
 * @param {string} url - URL для проверки
 * @returns {string} Безопасный URL или placeholder
 */
function sanitizeImageURL(url) {
    if (!url || typeof url !== 'string') {
        return 'https://via.placeholder.com/400x200?text=No+Image';
    }
    
    try {
        const urlObj = new URL(url);
        // Разрешаем только https и data: схемы
        if (urlObj.protocol === 'https:' || urlObj.protocol === 'data:') {
            return url;
        }
    } catch (e) {
        // Невалидный URL
    }
    
    return 'https://via.placeholder.com/400x200?text=Invalid+Image';
}

/**
 * Очищает пользовательский ввод для безопасного отображения
 * @param {string} input - Пользовательский ввод
 * @returns {string} Очищенная строка
 */
function sanitizeInput(input) {
    if (!input || typeof input !== 'string') return '';
    
    return input
        .replace(/[<>]/g, '') // Удаляем < и >
        .replace(/javascript:/gi, '') // Удаляем javascript:
        .replace(/on\w+=/gi, '') // Удаляем обработчики событий
        .trim();
}
