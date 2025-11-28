-- ============================================
-- PostgreSQL Schema для системы безопасности Rentify
-- Используется для транзакций и критичных операций
-- ============================================

-- Создание базы данных
CREATE DATABASE rentify_security;

\c rentify_security;

-- Расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. ТАБЛИЦА: users
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL CHECK (phone ~ '^\+7\d{10}$'),
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Верификация
    phone_verified BOOLEAN DEFAULT FALSE,
    phone_verified_at TIMESTAMP,
    liveness_verified BOOLEAN DEFAULT FALSE,
    liveness_verified_at TIMESTAMP,
    liveness_score SMALLINT CHECK (liveness_score BETWEEN 0 AND 100),
    id_verified BOOLEAN DEFAULT FALSE,
    id_verified_at TIMESTAMP,
    id_type VARCHAR(50),
    is_fully_verified BOOLEAN DEFAULT FALSE,
    verification_level SMALLINT DEFAULT 0 CHECK (verification_level BETWEEN 0 AND 3),
    
    -- Рейтинг
    rating_average DECIMAL(3, 2) DEFAULT 0.00 CHECK (rating_average BETWEEN 0 AND 5),
    rating_count INT DEFAULT 0,
    trust_score SMALLINT DEFAULT 0 CHECK (trust_score BETWEEN 0 AND 100),
    
    -- Статистика
    total_transactions INT DEFAULT 0,
    completed_transactions INT DEFAULT 0,
    total_earned DECIMAL(12, 2) DEFAULT 0,
    total_spent DECIMAL(12, 2) DEFAULT 0,
    
    -- Безопасность
    last_login_at TIMESTAMP,
    last_login_ip INET,
    failed_login_attempts SMALLINT DEFAULT 0,
    account_locked_until TIMESTAMP,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    
    -- Метаданные
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Индексы
    CONSTRAINT unique_user_id UNIQUE (user_id),
    CONSTRAINT unique_phone UNIQUE (phone)
);

-- Индексы для оптимизации
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_verified ON users(is_fully_verified);
CREATE INDEX idx_users_trust_score ON users(trust_score DESC);
CREATE INDEX idx_users_rating ON users(rating_average DESC);

-- ============================================
-- 2. ТАБЛИЦА: sms_verifications
-- ============================================

CREATE TABLE sms_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_id VARCHAR(100) UNIQUE NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    
    code_hash VARCHAR(255) NOT NULL,
    
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'expired', 'failed')),
    
    attempts SMALLINT DEFAULT 0,
    max_attempts SMALLINT DEFAULT 3,
    
    ip_address INET,
    device_info TEXT,
    
    provider VARCHAR(20) DEFAULT 'smsc' CHECK (provider IN ('twilio', 'smsc', 'firebase', 'test')),
    provider_id VARCHAR(100),
    
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы
CREATE INDEX idx_sms_user_id ON sms_verifications(user_id);
CREATE INDEX idx_sms_expires_at ON sms_verifications(expires_at);
CREATE INDEX idx_sms_status ON sms_verifications(status);

-- Автоматическое удаление истекших записей (через pg_cron или приложение)

-- ============================================
-- 3. ТАБЛИЦА: liveness_checks
-- ============================================

CREATE TABLE liveness_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(100) UNIQUE NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    
    video_url TEXT,
    video_hash VARCHAR(64),
    video_duration DECIMAL(5, 2),
    
    ai_provider VARCHAR(30) NOT NULL CHECK (ai_provider IN ('facepp', 'azure', 'hive', 'aws_rekognition')),
    
    liveness_score SMALLINT CHECK (liveness_score BETWEEN 0 AND 100),
    face_detected BOOLEAN,
    face_quality SMALLINT CHECK (face_quality BETWEEN 0 AND 100),
    
    -- Детальные проверки
    eye_movement BOOLEAN,
    head_rotation BOOLEAN,
    blink_detected BOOLEAN,
    lip_movement BOOLEAN,
    depth_detected BOOLEAN,
    screen_detection BOOLEAN,
    
    passed BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'passed', 'failed', 'error')),
    failure_reason TEXT,
    
    ip_address INET,
    device_info TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours')
);

-- Индексы
CREATE INDEX idx_liveness_user_id ON liveness_checks(user_id);
CREATE INDEX idx_liveness_session ON liveness_checks(session_id);
CREATE INDEX idx_liveness_status ON liveness_checks(status);

-- ============================================
-- 4. ТАБЛИЦА: id_verifications
-- ============================================

CREATE TABLE id_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_id VARCHAR(100) UNIQUE NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    
    document_type VARCHAR(30) NOT NULL CHECK (document_type IN ('id_card', 'passport', 'driving_license')),
    
    front_image_url TEXT,
    back_image_url TEXT,
    front_image_hash VARCHAR(64),
    back_image_hash VARCHAR(64),
    
    -- OCR данные (JSON)
    ocr_data JSONB,
    
    ocr_provider VARCHAR(30) CHECK (ocr_provider IN ('regula', 'smartid', 'tesseract', 'aws_textract')),
    ocr_confidence SMALLINT CHECK (ocr_confidence BETWEEN 0 AND 100),
    
    -- Проверки документа
    mrz_valid BOOLEAN,
    barcode_valid BOOLEAN,
    hologram_detected BOOLEAN,
    tamper_detected BOOLEAN,
    photocopy_detected BOOLEAN,
    
    -- Сравнение лица
    face_match_confidence SMALLINT CHECK (face_match_confidence BETWEEN 0 AND 100),
    face_matched BOOLEAN,
    liveness_session_id VARCHAR(100),
    
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected', 'manual_review')),
    passed BOOLEAN DEFAULT FALSE,
    rejection_reason TEXT,
    
    -- Ручная проверка
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    
    ip_address INET,
    device_info TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '90 days')
);

-- Индексы
CREATE INDEX idx_id_verification_user ON id_verifications(user_id);
CREATE INDEX idx_id_verification_status ON id_verifications(status);
CREATE INDEX idx_id_verification_ocr_data ON id_verifications USING GIN (ocr_data);

-- ============================================
-- 5. ТАБЛИЦА: reviews
-- ============================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id VARCHAR(100) UNIQUE NOT NULL,
    
    reviewer_id VARCHAR(100) NOT NULL,
    reviewer_name VARCHAR(255),
    
    reviewee_id VARCHAR(100) NOT NULL,
    reviewee_name VARCHAR(255),
    
    transaction_id VARCHAR(100) NOT NULL,
    item_id VARCHAR(100),
    item_name VARCHAR(255),
    
    role VARCHAR(10) NOT NULL CHECK (role IN ('owner', 'renter')),
    
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    
    -- Детальные оценки
    communication_rating SMALLINT CHECK (communication_rating BETWEEN 1 AND 5),
    punctuality_rating SMALLINT CHECK (punctuality_rating BETWEEN 1 AND 5),
    item_condition_rating SMALLINT CHECK (item_condition_rating BETWEEN 1 AND 5),
    carefulness_rating SMALLINT CHECK (carefulness_rating BETWEEN 1 AND 5),
    
    comment TEXT CHECK (char_length(comment) <= 1000),
    
    tags TEXT[], -- Массив тегов
    
    is_public BOOLEAN DEFAULT TRUE,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP,
    
    flagged BOOLEAN DEFAULT FALSE,
    flag_reason TEXT,
    
    helpful_count INT DEFAULT 0,
    
    -- Ответ
    response_text TEXT,
    responded_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Уникальность: один отзыв на транзакцию от одного пользователя
    CONSTRAINT unique_review_per_transaction UNIQUE (reviewer_id, transaction_id)
);

-- Индексы
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_reviews_transaction ON reviews(transaction_id);
CREATE INDEX idx_reviews_rating ON reviews(reviewee_id, rating DESC);

-- ============================================
-- 6. ТАБЛИЦА: transactions
-- ============================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    
    owner_id VARCHAR(100) NOT NULL,
    owner_name VARCHAR(255),
    
    renter_id VARCHAR(100) NOT NULL,
    renter_name VARCHAR(255),
    
    item_id VARCHAR(100) NOT NULL,
    item_name VARCHAR(255),
    item_category VARCHAR(100),
    
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    
    price_per_day DECIMAL(10, 2) NOT NULL,
    total_days INT,
    total_price DECIMAL(12, 2) NOT NULL,
    deposit DECIMAL(12, 2),
    
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled', 'disputed')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    
    owner_reviewed BOOLEAN DEFAULT FALSE,
    renter_reviewed BOOLEAN DEFAULT FALSE,
    
    has_issues BOOLEAN DEFAULT FALSE,
    issue_description TEXT,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы
CREATE INDEX idx_transactions_owner ON transactions(owner_id, status);
CREATE INDEX idx_transactions_renter ON transactions(renter_id, status);
CREATE INDEX idx_transactions_status ON transactions(status, end_date);
CREATE INDEX idx_transactions_dates ON transactions(start_date, end_date);

-- ============================================
-- 7. ТАБЛИЦА: badges (Бейджи пользователей)
-- ============================================

CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100) NOT NULL,
    badge_type VARCHAR(50) NOT NULL CHECK (badge_type IN (
        'phone_verified', 
        'id_verified', 
        'liveness_verified', 
        'trusted_owner', 
        'trusted_renter', 
        'superhero', 
        'new_user',
        'fast_responder',
        'top_rated',
        'veteran'
    )),
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_user_badge UNIQUE (user_id, badge_type)
);

CREATE INDEX idx_badges_user ON user_badges(user_id);

-- ============================================
-- 8. ТАБЛИЦА: audit_logs (Аудит действий)
-- ============================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(100),
    
    ip_address INET,
    user_agent TEXT,
    
    old_value JSONB,
    new_value JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ============================================
-- ФУНКЦИИ И ТРИГГЕРЫ
-- ============================================

-- Функция обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ПРЕДСТАВЛЕНИЯ (Views)
-- ============================================

-- Представление: Полностью верифицированные пользователи
CREATE VIEW verified_users AS
SELECT 
    user_id,
    name,
    phone,
    rating_average,
    trust_score,
    verification_level,
    total_transactions,
    completed_transactions,
    created_at
FROM users
WHERE is_fully_verified = TRUE
ORDER BY trust_score DESC;

-- Представление: Статистика пользователя
CREATE VIEW user_stats AS
SELECT 
    u.user_id,
    u.name,
    u.rating_average,
    u.rating_count,
    u.trust_score,
    u.total_transactions,
    u.completed_transactions,
    COUNT(DISTINCT b.badge_type) as badge_count,
    ARRAY_AGG(DISTINCT b.badge_type) as badges
FROM users u
LEFT JOIN user_badges b ON u.user_id = b.user_id
GROUP BY u.user_id, u.name, u.rating_average, u.rating_count, u.trust_score, u.total_transactions, u.completed_transactions;

-- Представление: Активные транзакции
CREATE VIEW active_transactions AS
SELECT 
    transaction_id,
    owner_id,
    owner_name,
    renter_id,
    renter_name,
    item_name,
    start_date,
    end_date,
    total_price,
    status
FROM transactions
WHERE status IN ('confirmed', 'active')
ORDER BY start_date DESC;

-- ============================================
-- КОММЕНТАРИИ
-- ============================================

COMMENT ON TABLE users IS 'Основная таблица пользователей с верификацией и рейтингом';
COMMENT ON TABLE sms_verifications IS 'SMS коды верификации с TTL';
COMMENT ON TABLE liveness_checks IS 'Результаты AI проверки живости пользователя';
COMMENT ON TABLE id_verifications IS 'Верификация документов с OCR и проверкой подлинности';
COMMENT ON TABLE reviews IS 'Отзывы и рейтинги пользователей';
COMMENT ON TABLE transactions IS 'История транзакций аренды';
COMMENT ON TABLE user_badges IS 'Бейджи и достижения пользователей';
COMMENT ON TABLE audit_logs IS 'Журнал аудита всех действий в системе';

-- ============================================
-- SAMPLE DATA (для тестирования)
-- ============================================

-- Тестовый пользователь
INSERT INTO users (user_id, phone, name, password_hash, phone_verified, is_fully_verified, verification_level, rating_average, trust_score)
VALUES 
    ('user_test_001', '+77001234567', 'Тестовый Пользователь', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lHbkqVBN7Q/W', TRUE, TRUE, 3, 4.8, 95);

-- Готово!
SELECT 'Database schema created successfully!' AS status;
