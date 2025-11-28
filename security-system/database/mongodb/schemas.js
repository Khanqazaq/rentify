/**
 * MongoDB Schemas для системы безопасности Rentify
 * База данных: MongoDB
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// ============================================
// 1. ПОЛЬЗОВАТЕЛЬ (Users)
// ============================================

const UserSchema = new Schema({
    // Основная информация
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        match: /^\+7\d{10}$/
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        sparse: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    
    // Пароль (хешированный)
    passwordHash: {
        type: String,
        required: true
    },
    
    // Статусы верификации
    verification: {
        phoneVerified: {
            type: Boolean,
            default: false
        },
        phoneVerifiedAt: Date,
        
        livenessVerified: {
            type: Boolean,
            default: false
        },
        livenessVerifiedAt: Date,
        livenessScore: Number, // 0-100
        
        idVerified: {
            type: Boolean,
            default: false
        },
        idVerifiedAt: Date,
        idType: String, // 'passport', 'id_card', 'driving_license'
        
        // Комплексный статус
        isFullyVerified: {
            type: Boolean,
            default: false
        },
        verificationLevel: {
            type: Number,
            default: 0, // 0-3 (неверифицирован -> полностью верифицирован)
            min: 0,
            max: 3
        }
    },
    
    // Рейтинг и репутация
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        },
        asOwner: {
            average: Number,
            count: Number
        },
        asRenter: {
            average: Number,
            count: Number
        }
    },
    
    // Уровень доверия (Trust Score)
    trustScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    
    // Бейджи
    badges: [{
        type: {
            type: String,
            enum: ['phone_verified', 'id_verified', 'liveness_verified', 
                   'trusted_owner', 'trusted_renter', 'superhero', 'new_user']
        },
        earnedAt: Date
    }],
    
    // Статистика
    stats: {
        totalTransactions: {
            type: Number,
            default: 0
        },
        completedTransactions: {
            type: Number,
            default: 0
        },
        cancelledTransactions: {
            type: Number,
            default: 0
        },
        totalEarned: {
            type: Number,
            default: 0
        },
        totalSpent: {
            type: Number,
            default: 0
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        lastActiveAt: Date
    },
    
    // Безопасность
    security: {
        lastLoginAt: Date,
        lastLoginIp: String,
        lastLoginDevice: String,
        failedLoginAttempts: {
            type: Number,
            default: 0
        },
        accountLockedUntil: Date,
        twoFactorEnabled: {
            type: Boolean,
            default: false
        }
    },
    
    // Мета
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Индексы для оптимизации
UserSchema.index({ phone: 1 });
UserSchema.index({ 'verification.isFullyVerified': 1 });
UserSchema.index({ trustScore: -1 });
UserSchema.index({ 'rating.average': -1 });

// ============================================
// 2. SMS ВЕРИФИКАЦИЯ
// ============================================

const SMSVerificationSchema = new Schema({
    verificationId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    phone: {
        type: String,
        required: true
    },
    
    // Код
    codeHash: {
        type: String,
        required: true
    },
    code: String, // Только для development (удалить в production!)
    
    // Статус
    status: {
        type: String,
        enum: ['pending', 'verified', 'expired', 'failed'],
        default: 'pending'
    },
    
    // Попытки
    attempts: {
        type: Number,
        default: 0
    },
    maxAttempts: {
        type: Number,
        default: 3
    },
    
    // Безопасность
    ipAddress: String,
    deviceInfo: String,
    
    // Провайдер
    provider: {
        type: String,
        enum: ['twilio', 'smsc', 'firebase', 'test'],
        default: 'smsc'
    },
    providerId: String, // ID от провайдера (для отслеживания)
    
    // Временные метки
    sentAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    verifiedAt: Date,
    
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// TTL Index - автоматическое удаление истекших кодов
SMSVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ============================================
// 3. LIVENESS ПРОВЕРКА
// ============================================

const LivenessCheckSchema = new Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    
    // Видео данные
    videoUrl: String, // Временный URL (удаляется через 24 часа)
    videoHash: String, // SHA-256 хеш для проверки целостности
    videoDuration: Number, // в секундах
    
    // Результаты AI
    aiProvider: {
        type: String,
        enum: ['facepp', 'azure', 'hive', 'aws_rekognition'],
        required: true
    },
    
    livenessScore: {
        type: Number,
        min: 0,
        max: 100
    },
    
    faceDetected: Boolean,
    faceQuality: {
        type: Number,
        min: 0,
        max: 100
    },
    
    checks: {
        eyeMovement: Boolean,
        headRotation: Boolean,
        blinkDetected: Boolean,
        lipMovement: Boolean,
        depthDetected: Boolean, // 3D проверка
        screenDetection: Boolean // Проверка на фото с экрана
    },
    
    // Результат
    passed: {
        type: Boolean,
        default: false
    },
    
    status: {
        type: String,
        enum: ['pending', 'processing', 'passed', 'failed', 'error'],
        default: 'pending'
    },
    
    failureReason: String, // 'low_quality', 'no_face', 'fake_detected', etc.
    
    // Мета
    ipAddress: String,
    deviceInfo: String,
    
    createdAt: {
        type: Date,
        default: Date.now
    },
    processedAt: Date,
    expiresAt: {
        type: Date,
        default: () => new Date(+new Date() + 24*60*60*1000) // 24 часа
    }
}, {
    timestamps: true
});

// TTL - удаление старых записей через 30 дней
LivenessCheckSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30*24*60*60 });

// ============================================
// 4. ID ВЕРИФИКАЦИЯ
// ============================================

const IDVerificationSchema = new Schema({
    verificationId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    
    // Тип документа
    documentType: {
        type: String,
        enum: ['id_card', 'passport', 'driving_license'],
        required: true
    },
    
    // Фотографии документа
    frontImageUrl: String,
    backImageUrl: String,
    frontImageHash: String,
    backImageHash: String,
    
    // OCR результаты
    ocrData: {
        fullName: String,
        firstName: String,
        lastName: String,
        middleName: String,
        
        iin: String, // ИИН (12 цифр)
        iinMasked: String, // Маскированный ИИН (********1234)
        
        dateOfBirth: Date,
        gender: {
            type: String,
            enum: ['M', 'F']
        },
        
        nationality: String,
        
        documentNumber: String,
        issueDate: Date,
        expiryDate: Date,
        issuedBy: String,
        
        address: String,
        
        // Дополнительно
        placeOfBirth: String
    },
    
    // OCR провайдер
    ocrProvider: {
        type: String,
        enum: ['regula', 'smartid', 'tesseract', 'aws_textract']
    },
    
    ocrConfidence: {
        type: Number,
        min: 0,
        max: 100
    },
    
    // Проверка подлинности документа
    documentChecks: {
        mrzValid: Boolean, // Machine Readable Zone
        barcodeValid: Boolean,
        hologramDetected: Boolean,
        tamperDetected: Boolean,
        photocopyDetected: Boolean
    },
    
    // Сравнение лица (ID фото vs селфи)
    faceMatch: {
        confidence: {
            type: Number,
            min: 0,
            max: 100
        },
        matched: Boolean,
        livenessSessionId: String // Ссылка на liveness проверку
    },
    
    // Статус
    status: {
        type: String,
        enum: ['pending', 'processing', 'approved', 'rejected', 'manual_review'],
        default: 'pending'
    },
    
    passed: {
        type: Boolean,
        default: false
    },
    
    rejectionReason: String,
    
    // Для ручной проверки
    reviewedBy: String, // admin ID
    reviewedAt: Date,
    reviewNotes: String,
    
    // Мета
    ipAddress: String,
    deviceInfo: String,
    
    createdAt: {
        type: Date,
        default: Date.now
    },
    processedAt: Date,
    expiresAt: {
        type: Date,
        default: () => new Date(+new Date() + 90*24*60*60*1000) // 90 дней
    }
}, {
    timestamps: true
});

// Индексы
IDVerificationSchema.index({ userId: 1, status: 1 });
IDVerificationSchema.index({ 'ocrData.iin': 1 }, { sparse: true });

// ============================================
// 5. ОТЗЫВЫ (Reviews)
// ============================================

const ReviewSchema = new Schema({
    reviewId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    
    // Кто оставил отзыв
    reviewerId: {
        type: String,
        required: true,
        index: true
    },
    reviewerName: String,
    
    // О ком отзыв
    revieweeId: {
        type: String,
        required: true,
        index: true
    },
    revieweeName: String,
    
    // Связь с транзакцией
    transactionId: {
        type: String,
        required: true,
        index: true
    },
    itemId: String,
    itemName: String,
    
    // Роль в сделке
    role: {
        type: String,
        enum: ['owner', 'renter'],
        required: true // Кем был reviewee в этой сделке
    },
    
    // Оценка
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    
    // Детальные оценки
    detailedRating: {
        communication: Number, // 1-5
        punctuality: Number,
        itemCondition: Number, // Для owner
        carefulness: Number, // Для renter
        overall: Number
    },
    
    // Отзыв
    comment: {
        type: String,
        maxlength: 1000,
        trim: true
    },
    
    // Теги
    tags: [{
        type: String,
        enum: ['friendly', 'professional', 'responsive', 'punctual', 
               'clean', 'careful', 'flexible', 'recommended',
               'slow_response', 'late', 'rude', 'damaged_item']
    }],
    
    // Статус
    isPublic: {
        type: Boolean,
        default: true
    },
    
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: Date,
    
    // Модерация
    flagged: {
        type: Boolean,
        default: false
    },
    flagReason: String,
    
    // Реакция
    helpful: {
        type: Number,
        default: 0
    },
    
    // Ответ от reviewee
    response: {
        text: String,
        respondedAt: Date
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Композитный индекс - один отзыв на транзакцию от одного пользователя
ReviewSchema.index({ reviewerId: 1, transactionId: 1 }, { unique: true });
ReviewSchema.index({ revieweeId: 1, rating: -1 });

// ============================================
// 6. ТРАНЗАКЦИИ (Transactions)
// ============================================

const TransactionSchema = new Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    
    // Участники
    ownerId: {
        type: String,
        required: true,
        index: true
    },
    ownerName: String,
    
    renterId: {
        type: String,
        required: true,
        index: true
    },
    renterName: String,
    
    // Вещь
    itemId: {
        type: String,
        required: true,
        index: true
    },
    itemName: String,
    itemCategory: String,
    
    // Период аренды
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    
    // Финансы
    pricePerDay: {
        type: Number,
        required: true
    },
    totalDays: Number,
    totalPrice: {
        type: Number,
        required: true
    },
    deposit: Number,
    
    // Статус
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'disputed'],
        default: 'pending'
    },
    
    // Временные метки
    createdAt: {
        type: Date,
        default: Date.now
    },
    confirmedAt: Date,
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    
    // Отзывы
    reviews: {
        ownerReviewed: {
            type: Boolean,
            default: false
        },
        renterReviewed: {
            type: Boolean,
            default: false
        }
    },
    
    // Проблемы
    hasIssues: {
        type: Boolean,
        default: false
    },
    issueDescription: String,
    
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Индексы
TransactionSchema.index({ ownerId: 1, status: 1 });
TransactionSchema.index({ renterId: 1, status: 1 });
TransactionSchema.index({ status: 1, endDate: 1 });

// ============================================
// ЭКСПОРТ МОДЕЛЕЙ
// ============================================

module.exports = {
    User: mongoose.model('User', UserSchema),
    SMSVerification: mongoose.model('SMSVerification', SMSVerificationSchema),
    LivenessCheck: mongoose.model('LivenessCheck', LivenessCheckSchema),
    IDVerification: mongoose.model('IDVerification', IDVerificationSchema),
    Review: mongoose.model('Review', ReviewSchema),
    Transaction: mongoose.model('Transaction', TransactionSchema)
};
