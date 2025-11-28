/**
 * Utility Functions
 */

const crypto = require('crypto');

/**
 * Генерация 6-значного кода верификации
 */
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Генерация уникального ID
 */
function generateUniqueId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
}

/**
 * Хеширование строки
 */
function hashString(str) {
    return crypto.createHash('sha256').update(str).digest('hex');
}

/**
 * Валидация номера телефона (Казахстан)
 */
function validatePhone(phone) {
    const phoneRegex = /^\+7\d{10}$/;
    return phoneRegex.test(phone);
}

/**
 * Валидация ИИН (12 цифр)
 */
function validateIIN(iin) {
    if (!/^\d{12}$/.test(iin)) return false;
    
    // Проверка контрольной суммы ИИН
    const weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    let sum = 0;
    
    for (let i = 0; i < 11; i++) {
        sum += parseInt(iin[i]) * weights[i];
    }
    
    let checksum = sum % 11;
    
    if (checksum === 10) {
        sum = 0;
        const weights2 = [3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2];
        for (let i = 0; i < 11; i++) {
            sum += parseInt(iin[i]) * weights2[i];
        }
        checksum = sum % 11;
    }
    
    return checksum === parseInt(iin[11]);
}

/**
 * Форматирование номера телефона
 */
function formatPhone(phone) {
    // Убираем все, кроме цифр
    const digits = phone.replace(/\D/g, '');
    
    // Добавляем +7 если нужно
    if (digits.length === 10) {
        return `+7${digits}`;
    } else if (digits.length === 11 && digits[0] === '7') {
        return `+${digits}`;
    }
    
    return phone;
}

/**
 * Маскирование ИИН
 */
function maskIIN(iin) {
    if (!iin || iin.length !== 12) return iin;
    return '*'.repeat(8) + iin.slice(-4);
}

/**
 * Маскирование email
 */
function maskEmail(email) {
    if (!email) return email;
    const [name, domain] = email.split('@');
    if (!domain) return email;
    
    const maskedName = name.length > 2 
        ? name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
        : name;
    
    return `${maskedName}@${domain}`;
}

/**
 * Задержка (для тестирования)
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Случайное число в диапазоне
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Проверка валидности даты
 */
function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

/**
 * Возраст по дате рождения
 */
function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

/**
 * Санитизация строки
 */
function sanitizeString(str) {
    if (!str) return '';
    return str.replace(/[<>]/g, '').trim();
}

/**
 * Проверка на спам (простая)
 */
function containsSpam(text) {
    const spamWords = ['viagra', 'casino', 'winner', 'prize', 'click here', 'free money'];
    const lowerText = text.toLowerCase();
    return spamWords.some(word => lowerText.includes(word));
}

/**
 * Ограничение длины текста
 */
function truncate(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Генерация случайной строки
 */
function randomString(length = 8) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
}

/**
 * Проверка прочности пароля
 */
function checkPasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    let score = 0;
    if (password.length >= minLength) score++;
    if (hasUpperCase) score++;
    if (hasLowerCase) score++;
    if (hasNumbers) score++;
    if (hasSpecialChar) score++;
    
    return {
        score, // 0-5
        isStrong: score >= 4,
        feedback: {
            length: password.length >= minLength,
            uppercase: hasUpperCase,
            lowercase: hasLowerCase,
            numbers: hasNumbers,
            special: hasSpecialChar
        }
    };
}

module.exports = {
    generateVerificationCode,
    generateUniqueId,
    hashString,
    validatePhone,
    validateIIN,
    formatPhone,
    maskIIN,
    maskEmail,
    delay,
    randomInt,
    isValidDate,
    calculateAge,
    sanitizeString,
    containsSpam,
    truncate,
    randomString,
    checkPasswordStrength
};
