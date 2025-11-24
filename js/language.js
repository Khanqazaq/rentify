// ========== ПЕРЕВОДЫ ==========
const translations = {
    ru: {
        search: 'Поиск вещей...',
        city: 'Город',
        find: 'Найти',
        allItems: 'Все вещи',
        addItem: 'Добавить вещь',
        login: 'Войти',
        title: 'Арендуй вещи, которые нужны',
        titleHighlight: 'когда они нужны',
        description: 'От камер и ноутбуков до инструментов и велосипедов. Арендуй у проверенных пользователей безопасно и выгодно.',
        startSearch: 'Начать поиск',
        rentOut: 'Сдать вещь в аренду'
    },
    kk: {
        search: 'Заттарды іздеу...',
        city: 'Қала',
        find: 'Іздеу',
        allItems: 'Барлық заттар',
        addItem: 'Зат қосу',
        login: 'Кіру',
        title: 'Қажет заттарды жалға алыңыз',
        titleHighlight: 'қажет болғанда',
        description: 'Камералардан ноутбуктерге дейін, құрал-жабдықтан велосипедтерге дейін. Сенімді пайдаланушылардан қауіпсіз және тиімді түрде жалға алыңыз.',
        startSearch: 'Іздеуді бастау',
        rentOut: 'Затты жалға беру'
    }
};

// Additional keys for login, registration, chat and modals
translations.ru.login_phone_placeholder = '7011234567';
translations.kk.login_phone_placeholder = '7011234567';

translations.ru.login_password_placeholder = 'Пароль';
translations.kk.login_password_placeholder = 'Құпия сөз';

translations.ru.login_button = 'Войти';
translations.kk.login_button = 'Кіру';

translations.ru.login_alert_invalid_phone_example = 'Введите корректный 10-значный номер для Казахстана, например: 7011234567';
translations.kk.login_alert_invalid_phone_example = 'Қазақстан үшін дұрыс 10 таңбалы нөмірді енгізіңіз, мысалы: 7011234567';

translations.ru.login_alert_enter_password = 'Введите пароль';
translations.kk.login_alert_enter_password = 'Құпия сөзді енгізіңіз';

translations.ru.login_alert_login_success = 'Вход выполнен! Добро пожаловать.';
translations.kk.login_alert_login_success = 'Кіру сәтті! Қош келдіңіз.';

translations.ru.login_alert_invalid_credentials = 'Неверный логин или пароль.';
translations.kk.login_alert_invalid_credentials = 'Қате логин немесе құпия сөз.';

translations.ru.login_alert_google_demo = 'Вход через Google (Это демо версия)';
translations.kk.login_alert_google_demo = 'Google арқылы кіру (демо нұсқа)';

translations.ru.login_alert_phone_field_not_found = 'Поле телефона не найдено.';
translations.kk.login_alert_phone_field_not_found = 'Телефон өрісі табылмады.';

// Registration alerts
translations.ru.reg_alert_invalid_phone_example = 'Введите корректный 10-значный номер KZ, например 7011234567';
translations.kk.reg_alert_invalid_phone_example = 'Қазақстан үшін дұрыс 10 таңбалы нөмірді енгізіңіз, мысалы: 7011234567';

translations.ru.reg_demo_code_msg = 'Демо: код подтверждения = ';
translations.kk.reg_demo_code_msg = 'Демо: растайтын код = ';

translations.ru.reg_alert_enter_code = 'Введите код';
translations.kk.reg_alert_enter_code = 'Кодты енгізіңіз';

translations.ru.reg_alert_password_min = 'Введите пароль (минимум 4 символа)';
translations.kk.reg_alert_password_min = 'Құпия сөзді енгізіңіз (кем дегенде 4 таңба)';

translations.ru.reg_alert_send_code_first = 'Сначала отправьте код подтверждения.';
translations.kk.reg_alert_send_code_first = 'Бірінші растайтын кодты жіберіңіз.';

translations.ru.reg_alert_code_expired = 'Код истёк. Пожалуйста, запросите новый.';
translations.kk.reg_alert_code_expired = 'Кодтың мерзімі өтті. Жаңа код сұраңыз.';

translations.ru.reg_alert_invalid_code = 'Неверный код.';
translations.kk.reg_alert_invalid_code = 'Қате код.';

translations.ru.reg_alert_user_exists = 'Пользователь с этим номером уже зарегистрирован.';
translations.kk.reg_alert_user_exists = 'Осы нөмірмен пайдаланушы тіркелген.';

translations.ru.reg_alert_success = 'Регистрация успешна! Вы теперь можете войти с номером и паролем.';
translations.kk.reg_alert_success = 'Тіркеу сәтті! Енді нөмір мен құпия сөз арқылы кіре аласыз.';

// Geolocation / location
translations.ru.geo_not_supported = 'Геолокация не поддерживается в этом браузере.';
translations.kk.geo_not_supported = 'Бұл шолғышта геолокация қолдау көрсетілмейді.';

translations.ru.geo_determined_prefix = 'Определено: ';
translations.kk.geo_determined_prefix = 'Анықталды: ';

translations.ru.geo_failed = 'Не удалось определить адрес по координатам.';
translations.kk.geo_failed = 'Координаттар бойынша мекенжайды анықтау мүмкін болмады.';

translations.ru.geo_permission_denied = 'Разрешение на геолокацию не предоставлено. Вы можете ввести город вручную.';
translations.kk.geo_permission_denied = 'Геолокацияға рұқсат берілмеді. Қалаңызды қолмен енгізе аласыз.';

translations.ru.geo_failed_message_prefix = 'Не удалось получить местоположение: ';
translations.kk.geo_failed_message_prefix = 'Мекенжайды алу мүмкін болмады: ';

translations.ru.loc_input_required = 'Введите город или адрес';
translations.kk.loc_input_required = 'Қала немесе мекенжайды енгізіңіз';

// Chat
translations.ru.chat_placeholder = 'Напишите сообщение...';
translations.kk.chat_placeholder = 'Хабарлама жазыңыз...';
translations.ru.chat_send = 'Отправить';
translations.kk.chat_send = 'Жіберу';
translations.ru.chat_role_renter = 'Я — арендатор';
translations.kk.chat_role_renter = 'Мен — жалға алушы';
translations.ru.chat_role_owner = 'Я — арендодатель';
translations.kk.chat_role_owner = 'Мен — жалға беруші';
translations.ru.chat_open = 'Открыть';
translations.kk.chat_open = 'Ашу';

// Buttons / common
translations.ru.send_code_button = 'Отправить код';
translations.kk.send_code_button = 'Код жіберу';
translations.ru.verify_button = 'Подтвердить';
translations.kk.verify_button = 'Растау';
translations.ru.cancel_button = 'Отмена';
translations.kk.cancel_button = 'Бас тарту';
translations.ru.publish_button = 'Опубликовать';
translations.kk.publish_button = 'Жариялау';
translations.ru.remember_me = 'Запомнить меня';
translations.kk.remember_me = 'Мені есте сақтау';
translations.ru.forgot_password = 'Забыли пароль?';
translations.kk.forgot_password = 'Құпия сөзді ұмыттыңыз ба?';



// ========== СМЕНА ЯЗЫКА ==========
function changeLanguage(lang) {
    const t = translations[lang];
    if (!t) return;
    
    // Сохранить выбор
    localStorage.setItem('language', lang);
    
    // Обновить текст
    const searchInputs = document.querySelectorAll('#searchInput, #searchBox');
    searchInputs.forEach(input => {
        if (input) input.placeholder = t.search;
    });
    
    const cityInput = document.getElementById('cityBox');
    if (cityInput) cityInput.placeholder = t.city;
    
    const findBtn = document.querySelector('.btn-primary');
    if (findBtn && findBtn.textContent.includes('Найти')) {
        findBtn.textContent = t.find;
    }
    
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const parts = heroTitle.innerHTML.split('<span');
        heroTitle.innerHTML = `${t.title}<span class="gradient-text">${t.titleHighlight}</span>`;
    }
    
    const heroDesc = document.querySelector('.hero-description');
    if (heroDesc) heroDesc.textContent = t.description;
    
    const buttons = document.querySelectorAll('.hero-buttons .btn');
    if (buttons[0]) buttons[0].textContent = t.startSearch;
    if (buttons[1]) buttons[1].textContent = t.rentOut;
    
    // Обновить меню
    const navLinks = document.querySelectorAll('.nav-menu a');
    if (navLinks[0]) navLinks[0].textContent = t.allItems;
    if (navLinks[1]) navLinks[1].textContent = t.addItem;
    if (navLinks[2]) navLinks[2].textContent = t.login;

    // --- Login / Registration page elements (if present) ---
    const phone = document.getElementById('phoneNumber');
    if (phone && t.login_phone_placeholder) phone.placeholder = t.login_phone_placeholder;

    const regPhone = document.getElementById('regPhone');
    if (regPhone && t.login_phone_placeholder) regPhone.placeholder = t.login_phone_placeholder;

    // password placeholders: regPassword and first password input
    const regPass = document.getElementById('regPassword');
    if (regPass && t.login_password_placeholder) regPass.placeholder = t.login_password_placeholder;
    const anyPassword = document.querySelector('.login-box input[type="password"]');
    if (anyPassword && t.login_password_placeholder) anyPassword.placeholder = t.login_password_placeholder;

    // login form submit button
    const loginSubmit = document.querySelector('.login-box form button[type="submit"]');
    if (loginSubmit && t.login_button) loginSubmit.textContent = t.login_button;

    // remember me, forgot password
    const rememberLabel = document.querySelector('.form-options label');
    if (rememberLabel && t.remember_me) rememberLabel.childNodes[1] && (rememberLabel.childNodes[1].textContent = ' ' + t.remember_me);
    const forgotLink = document.querySelector('.form-options a');
    if (forgotLink && t.forgot_password) forgotLink.textContent = t.forgot_password;

    // Registration buttons
    const sendCodeBtn = document.getElementById('send-code-btn');
    if (sendCodeBtn && t.send_code_button) sendCodeBtn.textContent = t.send_code_button;
    const verifyBtn = document.getElementById('verify-code-btn');
    if (verifyBtn && t.verify_button) verifyBtn.textContent = t.verify_button;
    const closeRegisterBtn = document.getElementById('close-register');
    if (closeRegisterBtn && t.cancel_button) closeRegisterBtn.textContent = t.cancel_button;

    // Add listing modal buttons
    const addCancel = document.getElementById('add-cancel');
    if (addCancel && t.cancel_button) addCancel.textContent = t.cancel_button;
    const addSave = document.getElementById('add-save');
    if (addSave && t.publish_button) addSave.textContent = t.publish_button;

    // Chat widget
    const chatInput = document.getElementById('chatInput');
    if (chatInput && t.chat_placeholder) chatInput.placeholder = t.chat_placeholder;
    const chatSend = document.getElementById('chatSend');
    if (chatSend && t.chat_send) chatSend.textContent = t.chat_send;
    const chatRole = document.getElementById('chatRole');
    if (chatRole){
        if (chatRole.options && chatRole.options.length >= 2){
            chatRole.options[0].textContent = t.chat_role_renter || chatRole.options[0].textContent;
            chatRole.options[1].textContent = t.chat_role_owner || chatRole.options[1].textContent;
        }
    }
    const chatOpenBtn = document.getElementById('chatOpenConv');
    if (chatOpenBtn && t.chat_open) chatOpenBtn.textContent = t.chat_open;
}

// ========== ЗАГРУЗИТЬ СОХРАНЕННЫЙ ЯЗЫК ==========
document.addEventListener('DOMContentLoaded', function() {
    const savedLang = localStorage.getItem('language') || 'ru';
    changeLanguage(savedLang);
});

