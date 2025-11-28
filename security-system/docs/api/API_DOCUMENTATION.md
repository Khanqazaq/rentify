# 📡 API Документация - Rentify Security System

## Базовый URL

```
Production: https://api.rentify.kz/api
Development: http://localhost:3000/api
```

## Аутентификация

Все защищенные endpoints требуют JWT токен в заголовке:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔐 1. SMS Верификация

### 1.1 Отправка SMS кода

```http
POST /sms/send
```

**Request Body:**
```json
{
  "phone": "+77001234567",
  "userId": "user_123456"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Код отправлен на ваш номер",
  "data": {
    "verificationId": "sms_1706450000000_a1b2c3d4",
    "expiresAt": "2025-01-28T15:35:00.000Z",
    "code": "123456" // Только в development режиме!
  }
}
```

**Response Error (429):**
```json
{
  "success": false,
  "message": "Превышен лимит отправки SMS. Попробуйте через час."
}
```

### 1.2 Проверка SMS кода

```http
POST /sms/verify
```

**Request Body:**
```json
{
  "verificationId": "sms_1706450000000_a1b2c3d4",
  "code": "123456",
  "userId": "user_123456"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Телефон успешно подтвержден!",
  "data": {
    "verifiedAt": "2025-01-28T15:33:00.000Z"
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Неверный код. Осталось попыток: 2"
}
```

### 1.3 Статус верификации

```http
GET /sms/status/:userId
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "phoneVerified": true,
    "phoneVerifiedAt": "2025-01-28T15:33:00.000Z"
  }
}
```

---

## 📹 2. Liveness Проверка

### 2.1 Загрузка видео

```http
POST /liveness/upload
Content-Type: multipart/form-data
```

**Form Data:**
- `userId`: string (required)
- `video`: file (required, max 50MB, mp4/webm/mov)

**Response Success (200):**
```json
{
  "success": true,
  "message": "Видео загружено. Начата обработка.",
  "data": {
    "sessionId": "liveness_1706450000000_x1y2z3",
    "status": "processing"
  }
}
```

### 2.2 Статус проверки

```http
GET /liveness/status/:sessionId
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessionId": "liveness_1706450000000_x1y2z3",
    "status": "passed",
    "passed": true,
    "livenessScore": 87,
    "faceQuality": 92,
    "checks": {
      "eyeMovement": true,
      "headRotation": true,
      "blinkDetected": true,
      "lipMovement": false,
      "depthDetected": true,
      "screenDetection": false
    },
    "processedAt": "2025-01-28T15:40:00.000Z"
  }
}
```

**Возможные статусы:**
- `pending` - В очереди
- `processing` - Обрабатывается
- `passed` - Успешно пройдена
- `failed` - Не пройдена
- `error` - Ошибка обработки

---

## 🪪 3. ID Верификация

### 3.1 Загрузка документа

```http
POST /id/upload
Content-Type: multipart/form-data
```

**Form Data:**
- `userId`: string (required)
- `documentType`: string (required) - `id_card`, `passport`, `driving_license`
- `front`: file (required, max 10MB, jpg/png)
- `back`: file (optional, max 10MB, jpg/png)

**Response Success (200):**
```json
{
  "success": true,
  "message": "Документ загружен. Начата проверка.",
  "data": {
    "verificationId": "id_1706450000000_p9q8r7",
    "status": "processing"
  }
}
```

### 3.2 Статус проверки

```http
GET /id/status/:verificationId
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "verificationId": "id_1706450000000_p9q8r7",
    "status": "approved",
    "passed": true,
    "documentType": "id_card",
    "ocrData": {
      "fullName": "Иванов Иван Иванович",
      "iinMasked": "********5678",
      "dateOfBirth": "1990-05-15",
      "documentNumber": "123456789"
    },
    "ocrConfidence": 92,
    "faceMatch": {
      "confidence": 88,
      "matched": true,
      "livenessSessionId": "liveness_1706450000000_x1y2z3"
    },
    "processedAt": "2025-01-28T15:45:00.000Z"
  }
}
```

**Возможные статусы:**
- `pending` - В очереди
- `processing` - Обрабатывается
- `approved` - Одобрено
- `rejected` - Отклонено
- `manual_review` - Требуется ручная проверка

---

## ⭐ 4. Отзывы и Рейтинги

### 4.1 Создание отзыва

```http
POST /reviews/create
```

**Request Body:**
```json
{
  "reviewerId": "user_123456",
  "revieweeId": "user_789012",
  "transactionId": "txn_1706450000000",
  "rating": 5,
  "comment": "Отличный арендодатель! Вещь в идеальном состоянии.",
  "detailedRating": {
    "communication": 5,
    "punctuality": 5,
    "itemCondition": 5
  },
  "tags": ["friendly", "professional", "punctual"]
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Отзыв успешно создан",
  "data": {
    "reviewId": "review_1706450000000_m4n5",
    "rating": 5
  }
}
```

### 4.2 Получение отзывов пользователя

```http
GET /reviews/:userId?page=1&limit=10&role=owner
```

**Query Parameters:**
- `page` (optional): Номер страницы (default: 1)
- `limit` (optional): Количество на странице (default: 10)
- `role` (optional): Фильтр по роли (`owner` или `renter`)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "reviewId": "review_1706450000000_m4n5",
        "reviewerId": "user_123456",
        "reviewerName": "Алексей Петров",
        "rating": 5,
        "comment": "Отличный арендодатель!",
        "tags": ["friendly", "professional"],
        "createdAt": "2025-01-28T16:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### 4.3 Получение рейтинга пользователя

```http
GET /ratings/user/:userId
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "user_789012",
    "name": "Иван Иванов",
    "rating": {
      "average": 4.8,
      "count": 25,
      "asOwner": {
        "average": 4.9,
        "count": 15
      },
      "asRenter": {
        "average": 4.7,
        "count": 10
      }
    },
    "trustScore": 87,
    "badges": [
      {
        "type": "phone_verified",
        "earnedAt": "2025-01-15T10:00:00.000Z"
      },
      {
        "type": "id_verified",
        "earnedAt": "2025-01-20T14:00:00.000Z"
      },
      {
        "type": "trusted_owner",
        "earnedAt": "2025-01-25T12:00:00.000Z"
      }
    ],
    "verification": {
      "phoneVerified": true,
      "livenessVerified": true,
      "idVerified": true,
      "isFullyVerified": true,
      "verificationLevel": 3
    },
    "stats": {
      "totalTransactions": 30,
      "completedTransactions": 28,
      "totalEarned": 150000,
      "joinedAt": "2024-11-01T00:00:00.000Z"
    },
    "reviewStats": {
      "distribution": {
        "5": 20,
        "4": 4,
        "3": 1,
        "2": 0,
        "1": 0
      },
      "topTags": [
        { "tag": "friendly", "count": 18 },
        { "tag": "professional", "count": 15 },
        { "tag": "punctual", "count": 12 }
      ],
      "avgDetailedRatings": {
        "communication": 4.9,
        "punctuality": 4.8,
        "itemCondition": 4.9
      }
    }
  }
}
```

### 4.4 Ответ на отзыв

```http
POST /reviews/respond
```

**Request Body:**
```json
{
  "reviewId": "review_1706450000000_m4n5",
  "userId": "user_789012",
  "response": "Спасибо за отзыв! Было приятно с вами работать."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Ответ добавлен"
}
```

---

## 🚨 Коды ошибок

| Код | Описание |
|-----|----------|
| 200 | Успешный запрос |
| 201 | Ресурс создан |
| 400 | Неверный запрос |
| 401 | Не авторизован |
| 403 | Доступ запрещен |
| 404 | Не найдено |
| 429 | Слишком много запросов |
| 500 | Внутренняя ошибка сервера |

---

## 📊 Rate Limiting

**Общие запросы:**
- 100 запросов за 15 минут

**Верификация (SMS, Liveness, ID):**
- 5 попыток за 1 час

---

## 🔒 Безопасность

### Передача данных
- Используйте **HTTPS** в продакшене
- Храните JWT токены безопасно (HttpOnly cookies)
- Никогда не передавайте пароли в открытом виде

### Валидация файлов
- Максимальный размер видео: **50 МБ**
- Максимальный размер изображения: **10 МБ**
- Разрешенные форматы видео: **mp4, webm, mov**
- Разрешенные форматы изображений: **jpg, png**

---

## 💡 Примеры использования

### JavaScript (Fetch API)

```javascript
// Отправка SMS кода
async function sendSMS(phone, userId) {
    const response = await fetch('http://localhost:3000/api/sms/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ phone, userId })
    });
    
    const data = await response.json();
    return data;
}

// Использование
const result = await sendSMS('+77001234567', 'user_123');
console.log(result);
```

### cURL

```bash
# Отправка SMS
curl -X POST http://localhost:3000/api/sms/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "phone": "+77001234567",
    "userId": "user_123"
  }'

# Проверка кода
curl -X POST http://localhost:3000/api/sms/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "verificationId": "sms_1706450000000_a1b2c3d4",
    "code": "123456",
    "userId": "user_123"
  }'
```

---

## 🆘 Поддержка

**Email:** api-support@rentify.kz  
**Telegram:** @rentify_api  
**Документация:** https://docs.rentify.kz

---

**Версия API:** v1.0.0  
**Последнее обновление:** 28.01.2025
