// ========== ПЕРЕВОДЫ ==========
const translations = {
    ru: {
        search: 'Поиск вещей...',
        city: 'Город',
        find: 'Найти',
        allItems: 'Все вещи',
        addItem: 'Добавить вещь',
        login: 'Войти',
        title: 'Арендуй нужные вещи',
        titleHighlight: 'быстро и удобно',
        description: 'Когда вещи нужны на день, неделю или месяц — бери в аренду у людей рядом. Камеры, ноутбуки, инструменты, транспорт и многое другое. Проверенные пользователи. Безопасно. Выгодно.',
        startSearch: 'Начать поиск',
        rentOut: '💰 Заработать на своей вещи'
    },
    kk: {
        search: 'Заттарды іздеу...',
        city: 'Қала',
        find: 'Іздеу',
        allItems: 'Барлық заттар',
        addItem: 'Зат қосу',
        login: 'Кіру',
        title: 'Қажетті заттарды жалға алыңыз',
        titleHighlight: 'жылдам және ыңғайлы',
        description: 'Заттар бір күнге, аптаға немесе айға керек болса — жақын маңдағы адамдардан жалға алыңыз. Камералар, ноутбуктер, құралдар, көлік және басқа да көп нәрсе. Тексерілген пайдаланушылар. Қауіпсіз. Тиімді.',
        startSearch: 'Іздеуді бастау',
        rentOut: '💰 Өз затыңызбен табыс табыңыз'
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

// Page sections
translations.ru.popular_categories = 'Популярные категории';
translations.kk.popular_categories = 'Танымал санаттар';
translations.ru.featured_items = 'Рекомендуемые вещи';
translations.kk.featured_items = 'Ұсынылатын заттар';
translations.ru.view_all = 'Смотреть все →';
translations.kk.view_all = 'Барлығын көру →';
translations.ru.how_it_works = 'Как это работает';
translations.kk.how_it_works = 'Бұл қалай жұмыс істейді';
translations.ru.testimonials = 'Отзывы наших клиентов';
translations.kk.testimonials = 'Клиенттерімізден пікірлер';

// How it works steps
translations.ru.step1_title = 'Найдите нужную вещь';
translations.kk.step1_title = 'Қажетті затты табыңыз';
translations.ru.step1_desc = 'Ищите по категориям, фильтруйте по цене и местоположению';
translations.kk.step1_desc = 'Санаттар бойынша іздеңіз, баға және орналасу бойынша сүзіңіз';

translations.ru.step2_title = 'Забронируйте и оплатите';
translations.kk.step2_title = 'Броньдаңыз және төлеңіз';
translations.ru.step2_desc = 'Выберите даты аренды и безопасно оплатите через платформу';
translations.kk.step2_desc = 'Жалға алу күндерін таңдап, платформа арқылы қауіпсіз төлеңіз';

translations.ru.step3_title = 'Получите вещь';
translations.kk.step3_title = 'Затты алыңыз';
translations.ru.step3_desc = 'Встретьтесь с владельцем и заберите вещь в назначенное время';
translations.kk.step3_desc = 'Иемен кездесіп, белгіленген уақытта затты алыңыз';

translations.ru.step4_title = 'Оставьте отзыв';
translations.kk.step4_title = 'Пікір қалдырыңыз';
translations.ru.step4_desc = 'Поделитесь своим опытом и помогите другим пользователям';
translations.kk.step4_desc = 'Өз тәжірибеңізбен бөлісіп, басқа пайдаланушыларға көмектесіңіз';

// Categories
translations.ru.cat_electronics = 'Электроника';
translations.kk.cat_electronics = 'Электроника';
translations.ru.cat_clothing = 'Одежда';
translations.kk.cat_clothing = 'Киім';
translations.ru.cat_sports = 'Спорт';
translations.kk.cat_sports = 'Спорт';
translations.ru.cat_auto = 'Авто';
translations.kk.cat_auto = 'Көлік';
translations.ru.cat_tools = 'Инструменты';
translations.kk.cat_tools = 'Құралдар';
translations.ru.cat_cameras = 'Камеры';
translations.kk.cat_cameras = 'Камералар';
translations.ru.cat_bicycles = 'Велосипеды';
translations.kk.cat_bicycles = 'Велосипедтер';
translations.ru.cat_furniture = 'Мебель';
translations.kk.cat_furniture = 'Жиһаз';

// Stats
translations.ru.stat_items = 'Активных вещей';
translations.kk.stat_items = 'Белсенді заттар';
translations.ru.stat_users = 'Довольных пользователей';
translations.kk.stat_users = 'Қанағат пайдаланушылар';
translations.ru.stat_categories = 'Категорий';
translations.kk.stat_categories = 'Санаттар';
translations.ru.stat_rating = 'Средний рейтинг';
translations.kk.stat_rating = 'Орташа рейтинг';



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
        const mainTitle = heroTitle.querySelector('.hero-title-main');
        const gradientText = heroTitle.querySelector('.gradient-text');
        if (mainTitle) mainTitle.textContent = t.title;
        if (gradientText) gradientText.textContent = t.titleHighlight;
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
    
    // Page sections
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach((title, idx) => {
        const text = title.textContent.trim();
        if (text.includes('Популярные категории') || text.includes('Танымал санаттар')) {
            title.textContent = t.popular_categories;
        } else if (text.includes('Рекомендуемые вещи') || text.includes('Ұсынылатын заттар')) {
            title.textContent = t.featured_items;
        } else if (text.includes('Как это работает') || text.includes('қалай жұмыс істейді')) {
            title.textContent = t.how_it_works;
        } else if (text.includes('Отзывы') || text.includes('пікірлер')) {
            title.textContent = t.testimonials;
        }
    });
    
    // View all link
    const viewAllLink = document.querySelector('.view-all');
    if (viewAllLink) viewAllLink.textContent = t.view_all;
    
    // Categories
    const categoryNames = document.querySelectorAll('.category-name');
    categoryNames.forEach(cat => {
        const text = cat.textContent.trim();
        if (text === 'Электроника') cat.textContent = t.cat_electronics;
        else if (text === 'Одежда' || text === 'Киім') cat.textContent = t.cat_clothing;
        else if (text === 'Спорт') cat.textContent = t.cat_sports;
        else if (text === 'Авто' || text === 'Көлік') cat.textContent = t.cat_auto;
        else if (text === 'Инструменты' || text === 'Құралдар') cat.textContent = t.cat_tools;
        else if (text === 'Камеры' || text === 'Камералар') cat.textContent = t.cat_cameras;
        else if (text === 'Велосипеды' || text === 'Велосипедтер') cat.textContent = t.cat_bicycles;
        else if (text === 'Мебель' || text === 'Жиһаз') cat.textContent = t.cat_furniture;
    });
    
    // Stats
    const statLabels = document.querySelectorAll('.stat-label');
    statLabels.forEach((label, idx) => {
        if (idx === 0) label.textContent = t.stat_items;
        else if (idx === 1) label.textContent = t.stat_users;
        else if (idx === 2) label.textContent = t.stat_categories;
        else if (idx === 3) label.textContent = t.stat_rating;
    });
    
    // How it works steps
    const steps = document.querySelectorAll('.step');
    if (steps[0]) {
        const h3 = steps[0].querySelector('h3');
        const p = steps[0].querySelector('p');
        if (h3) h3.textContent = t.step1_title;
        if (p) p.textContent = t.step1_desc;
    }
    if (steps[1]) {
        const h3 = steps[1].querySelector('h3');
        const p = steps[1].querySelector('p');
        if (h3) h3.textContent = t.step2_title;
        if (p) p.textContent = t.step2_desc;
    }
    if (steps[2]) {
        const h3 = steps[2].querySelector('h3');
        const p = steps[2].querySelector('p');
        if (h3) h3.textContent = t.step3_title;
        if (p) p.textContent = t.step3_desc;
    }
    if (steps[3]) {
        const h3 = steps[3].querySelector('h3');
        const p = steps[3].querySelector('p');
        if (h3) h3.textContent = t.step4_title;
        if (p) p.textContent = t.step4_desc;
    }
}

// ========== ЗАГРУЗИТЬ СОХРАНЕННЫЙ ЯЗЫК ==========
document.addEventListener('DOMContentLoaded', function() {
    const savedLang = localStorage.getItem('language') || 'ru';
    changeLanguage(savedLang);
});

