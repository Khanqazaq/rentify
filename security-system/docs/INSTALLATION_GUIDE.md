# 🚀 Руководство по установке и запуску

## Полная инструкция по развертыванию системы безопасности Rentify

---

## 📋 Требования

### Системные требования

- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0
- **MongoDB**: >= 5.0
- **PostgreSQL**: >= 14.0 (опционально)
- **ОС**: Windows, macOS, Linux

### Проверка версий

```bash
node --version    # должно быть >= v16.0.0
npm --version     # должно быть >= 8.0.0
mongod --version  # должно быть >= 5.0
```

---

## 🔧 Установка

### Шаг 1: Клонирование репозитория

```bash
cd c:\Users\nadir\OneDrive\Desktop\simple-version
# Все файлы уже находятся в папке security-system/
```

### Шаг 2: Установка зависимостей Backend

```bash
cd security-system\backend
npm install
```

Это установит все необходимые пакеты:
- express
- mongoose
- bcrypt
- jsonwebtoken
- multer
- axios
- sharp
- и другие...

### Шаг 3: Установка MongoDB

#### Windows:

1. Скачайте MongoDB Community Server с https://www.mongodb.com/download-center/community
2. Установите MongoDB
3. Создайте папки для данных:

```powershell
mkdir C:\data\db
```

4. Запустите MongoDB:

```powershell
mongod --dbpath C:\data\db
```

#### macOS (Homebrew):

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu):

```bash
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Шаг 4: Настройка переменных окружения

```bash
cd security-system\backend
copy .env.example .env
```

Отредактируйте файл `.env`:

```bash
# Откройте в текстовом редакторе
notepad .env
```

**Минимальная конфигурация для запуска:**

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/rentify_security

# JWT секреты (замените на свои!)
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long_change_me
JWT_REFRESH_SECRET=your_refresh_token_secret_min_32_characters_long

# SMS провайдер (для тестирования)
SMS_PROVIDER=test

# Liveness AI (для тестирования можно оставить пустым)
LIVENESS_AI_PROVIDER=facepp

# OCR (для тестирования можно оставить пустым)
OCR_PROVIDER=tesseract

# Storage (для тестирования можно использовать локальное хранилище)
STORAGE_PROVIDER=aws

# Показывать SMS код в response (только для разработки!)
SHOW_SMS_CODE_IN_RESPONSE=true
```

### Шаг 5: Инициализация базы данных

```bash
# MongoDB создаст базу автоматически при первом подключении

# Для PostgreSQL (если используете):
cd ..\database\postgresql
psql -U postgres -f schema.sql
```

---

## ▶️ Запуск

### Development режим

```bash
cd security-system\backend
npm run dev
```

Вы должны увидеть:

```
==================================================
🚀 Rentify Security API Server
📍 Running on: http://localhost:3000
🌍 Environment: development
📊 MongoDB: Connected
==================================================
```

### Production режим

```bash
npm start
```

### Проверка работы API

Откройте в браузере:
```
http://localhost:3000
```

Или используйте curl:
```bash
curl http://localhost:3000/health
```

Ответ должен быть:
```json
{
  "status": "healthy",
  "mongodb": "connected",
  "uptime": 15.234,
  "timestamp": "2025-01-28T..."
}
```

---

## 🔌 Подключение внешних сервисов

### 1. SMS Провайдеры

#### Twilio

1. Зарегистрируйтесь на https://www.twilio.com
2. Получите Account SID и Auth Token
3. Добавьте в `.env`:

```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

#### SMSC.ru (для РФ/КЗ)

1. Зарегистрируйтесь на https://smsc.ru
2. Пополните баланс
3. Добавьте в `.env`:

```env
SMS_PROVIDER=smsc
SMSC_LOGIN=your_login
SMSC_PASSWORD=your_password
SMSC_SENDER=Rentify
```

### 2. Liveness AI

#### Face++ (рекомендуется)

1. Зарегистрируйтесь на https://www.faceplusplus.com
2. Создайте API ключ
3. Добавьте в `.env`:

```env
LIVENESS_AI_PROVIDER=facepp
FACEPP_API_KEY=your_api_key
FACEPP_API_SECRET=your_api_secret
```

#### Azure Face API

1. Создайте аккаунт Azure
2. Создайте Face API ресурс
3. Добавьте в `.env`:

```env
LIVENESS_AI_PROVIDER=azure
AZURE_FACE_KEY=your_subscription_key
AZURE_FACE_ENDPOINT=https://your-region.api.cognitive.microsoft.com
```

### 3. OCR Сервисы

#### REGULA (профессиональное решение)

1. Свяжитесь с https://regulaforensics.com
2. Получите API ключ
3. Добавьте в `.env`:

```env
OCR_PROVIDER=regula
REGULA_API_KEY=your_api_key
```

#### Tesseract (бесплатная альтернатива)

Уже включен в зависимости, просто укажите:

```env
OCR_PROVIDER=tesseract
```

### 4. Cloud Storage

#### AWS S3

1. Создайте AWS аккаунт
2. Создайте S3 bucket
3. Создайте IAM пользователя с доступом к S3
4. Добавьте в `.env`:

```env
STORAGE_PROVIDER=aws
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=rentify-security-storage
```

---

## 🌐 Интеграция с фронтендом

### Вариант 1: Модальные окна на вашем сайте

Добавьте в ваш `index.html`:

```html
<!-- Стили -->
<link rel="stylesheet" href="security-system/frontend/styles/verification.css">

<!-- Модальное окно SMS верификации -->
<div id="sms-modal" style="display:none;">
    <!-- Содержимое из sms-verification.html -->
</div>

<!-- Скрипты -->
<script src="security-system/frontend/js/sms-verification.js"></script>
```

Открытие модального окна:

```javascript
// В вашем main.js
function openSMSVerification() {
    document.getElementById('sms-modal').style.display = 'flex';
    // Инициализация модуля верификации
}
```

### Вариант 2: Отдельные страницы

Скопируйте файлы из `frontend/` в корень вашего проекта:

```
simple-version/
├── verification-sms.html
├── verification-liveness.html
├── verification-id.html
└── css/
    └── verification.css
```

### Вариант 3: iFrame

```html
<iframe 
    src="security-system/frontend/sms-verification.html" 
    width="100%" 
    height="600px"
    frameborder="0">
</iframe>
```

---

## 🧪 Тестирование

### Ручное тестирование

```bash
# 1. Отправка SMS (получите verificationId и code из консоли)
curl -X POST http://localhost:3000/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{"phone":"+77001234567","userId":"test_user_1"}'

# 2. Проверка кода
curl -X POST http://localhost:3000/api/sms/verify \
  -H "Content-Type: application/json" \
  -d '{"verificationId":"...","code":"123456","userId":"test_user_1"}'
```

### Автоматизированные тесты

```bash
npm test
```

---

## 🐛 Troubleshooting

### Проблема: MongoDB не подключается

**Решение:**
```bash
# Проверьте что MongoDB запущен
mongod --version

# Запустите MongoDB
mongod --dbpath C:\data\db

# Проверьте подключение
mongo
> show dbs
```

### Проблема: Порт 3000 занят

**Решение:**
```bash
# Измените порт в .env
PORT=3001
```

Или освободите порт 3000:
```powershell
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Проблема: Ошибки при установке зависимостей

**Решение:**
```bash
# Очистите кеш npm
npm cache clean --force

# Удалите node_modules и переустановите
rm -rf node_modules package-lock.json
npm install
```

### Проблема: Sharp не устанавливается (Windows)

**Решение:**
```bash
npm install --global windows-build-tools
npm install sharp
```

---

## 📦 Деплой на продакшен

### VPS (DigitalOcean, Hetzner, etc.)

```bash
# 1. Подключитесь к серверу
ssh root@your-server-ip

# 2. Установите Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Установите MongoDB
# См. https://docs.mongodb.com/manual/installation/

# 4. Клонируйте проект
git clone your-repo-url
cd security-system/backend

# 5. Установите зависимости
npm install --production

# 6. Настройте .env для продакшена
cp .env.example .env
nano .env

# 7. Установите PM2 для управления процессом
npm install -g pm2

# 8. Запустите сервер
pm2 start server.js --name rentify-security
pm2 save
pm2 startup
```

### Nginx как Reverse Proxy

```nginx
server {
    listen 80;
    server_name api.rentify.kz;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL с Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d api.rentify.kz
```

---

## 📊 Мониторинг

### Логирование

Логи сохраняются в:
```
backend/logs/security-system.log
```

Просмотр логов:
```bash
tail -f logs/security-system.log
```

### PM2 Monitoring

```bash
pm2 status
pm2 logs rentify-security
pm2 monit
```

---

## 🆘 Поддержка

**Email:** support@rentify.kz  
**Telegram:** @rentify_support  
**Документация:** https://docs.rentify.kz  
**GitHub Issues:** (ваш репозиторий)

---

## ✅ Checklist перед запуском в продакшен

- [ ] Все API ключи настроены в `.env`
- [ ] `NODE_ENV=production` в `.env`
- [ ] `SHOW_SMS_CODE_IN_RESPONSE=false`
- [ ] JWT секреты изменены на случайные (мин. 32 символа)
- [ ] MongoDB защищен паролем
- [ ] HTTPS настроен (SSL сертификат)
- [ ] Rate limiting включен
- [ ] CORS настроен для вашего домена
- [ ] Backup базы данных настроен
- [ ] Мониторинг и логирование работают
- [ ] Проведено тестирование всех модулей

---

**Успешного запуска! 🚀**
