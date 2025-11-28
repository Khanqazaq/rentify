/**
 * SMS Verification Controller
 * Отправка и проверка SMS кодов верификации
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { SMSVerification, User } = require('../models');
const smsService = require('../services/smsService');
const { generateVerificationCode } = require('../utils/helpers');

class SMSController {
    
    /**
     * Отправка SMS кода
     * POST /api/sms/send
     */
    async sendCode(req, res) {
        try {
            const { phone, userId } = req.body;
            const ipAddress = req.ip;
            const deviceInfo = req.headers['user-agent'];

            // Валидация номера телефона
            const phoneRegex = /^\+7\d{10}$/;
            if (!phoneRegex.test(phone)) {
                return res.status(400).json({
                    success: false,
                    message: 'Неверный формат номера телефона. Используйте: +7XXXXXXXXXX'
                });
            }

            // Проверка rate limiting - не более 3 попыток в час с одного IP
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const recentAttempts = await SMSVerification.countDocuments({
                ipAddress,
                sentAt: { $gte: oneHourAgo }
            });

            if (recentAttempts >= 3) {
                return res.status(429).json({
                    success: false,
                    message: 'Превышен лимит отправки SMS. Попробуйте через час.'
                });
            }

            // Проверка существующих активных кодов
            const existingCode = await SMSVerification.findOne({
                userId,
                status: 'pending',
                expiresAt: { $gt: new Date() }
            });

            if (existingCode) {
                return res.status(400).json({
                    success: false,
                    message: 'Код уже отправлен. Проверьте SMS или дождитесь истечения срока.',
                    expiresAt: existingCode.expiresAt
                });
            }

            // Генерация 6-значного кода
            const code = generateVerificationCode();
            const codeHash = await bcrypt.hash(code, 10);

            // Создание записи в БД
            const verificationId = `sms_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
            
            const verification = new SMSVerification({
                verificationId,
                userId,
                phone,
                codeHash,
                code: process.env.NODE_ENV === 'development' ? code : undefined, // Только для dev!
                ipAddress,
                deviceInfo,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 минут
                provider: process.env.SMS_PROVIDER || 'smsc'
            });

            // Отправка SMS
            let smsResult;
            try {
                smsResult = await smsService.sendVerificationCode(phone, code);
                verification.providerId = smsResult.messageId;
            } catch (smsError) {
                console.error('SMS sending error:', smsError);
                return res.status(500).json({
                    success: false,
                    message: 'Ошибка отправки SMS. Попробуйте позже.',
                    error: process.env.NODE_ENV === 'development' ? smsError.message : undefined
                });
            }

            await verification.save();

            // Логирование
            console.log(`SMS sent to ${phone}, verification ID: ${verificationId}`);

            res.status(200).json({
                success: true,
                message: 'Код отправлен на ваш номер',
                data: {
                    verificationId,
                    expiresAt: verification.expiresAt,
                    // В development режиме возвращаем код для тестирования
                    ...(process.env.NODE_ENV === 'development' && { code })
                }
            });

        } catch (error) {
            console.error('Send SMS error:', error);
            res.status(500).json({
                success: false,
                message: 'Внутренняя ошибка сервера',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Проверка SMS кода
     * POST /api/sms/verify
     */
    async verifyCode(req, res) {
        try {
            const { verificationId, code, userId } = req.body;

            if (!verificationId || !code) {
                return res.status(400).json({
                    success: false,
                    message: 'Не указан код или ID верификации'
                });
            }

            // Поиск верификации
            const verification = await SMSVerification.findOne({
                verificationId,
                userId,
                status: 'pending'
            });

            if (!verification) {
                return res.status(404).json({
                    success: false,
                    message: 'Верификация не найдена или уже использована'
                });
            }

            // Проверка срока действия
            if (new Date() > verification.expiresAt) {
                verification.status = 'expired';
                await verification.save();
                
                return res.status(400).json({
                    success: false,
                    message: 'Срок действия кода истек. Запросите новый код.'
                });
            }

            // Проверка количества попыток
            if (verification.attempts >= verification.maxAttempts) {
                verification.status = 'failed';
                await verification.save();
                
                return res.status(400).json({
                    success: false,
                    message: 'Превышено количество попыток. Запросите новый код.'
                });
            }

            // Проверка кода
            const isCodeValid = await bcrypt.compare(code.toString(), verification.codeHash);
            
            verification.attempts += 1;

            if (!isCodeValid) {
                await verification.save();
                
                const attemptsLeft = verification.maxAttempts - verification.attempts;
                
                return res.status(400).json({
                    success: false,
                    message: `Неверный код. Осталось попыток: ${attemptsLeft}`
                });
            }

            // Успешная верификация
            verification.status = 'verified';
            verification.verifiedAt = new Date();
            await verification.save();

            // Обновление статуса пользователя
            await User.findOneAndUpdate(
                { userId },
                {
                    $set: {
                        'verification.phoneVerified': true,
                        'verification.phoneVerifiedAt': new Date(),
                        'verification.verificationLevel': 1
                    },
                    $push: {
                        badges: {
                            type: 'phone_verified',
                            earnedAt: new Date()
                        }
                    }
                }
            );

            console.log(`Phone verified for user ${userId}`);

            res.status(200).json({
                success: true,
                message: 'Телефон успешно подтвержден!',
                data: {
                    verifiedAt: verification.verifiedAt
                }
            });

        } catch (error) {
            console.error('Verify SMS error:', error);
            res.status(500).json({
                success: false,
                message: 'Внутренняя ошибка сервера',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Получение статуса верификации
     * GET /api/sms/status/:userId
     */
    async getStatus(req, res) {
        try {
            const { userId } = req.params;

            const user = await User.findOne({ userId });
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Пользователь не найден'
                });
            }

            res.status(200).json({
                success: true,
                data: {
                    phoneVerified: user.verification.phoneVerified,
                    phoneVerifiedAt: user.verification.phoneVerifiedAt
                }
            });

        } catch (error) {
            console.error('Get SMS status error:', error);
            res.status(500).json({
                success: false,
                message: 'Внутренняя ошибка сервера'
            });
        }
    }

    /**
     * Повторная отправка кода
     * POST /api/sms/resend
     */
    async resendCode(req, res) {
        try {
            const { verificationId } = req.body;

            const verification = await SMSVerification.findOne({ verificationId });

            if (!verification) {
                return res.status(404).json({
                    success: false,
                    message: 'Верификация не найдена'
                });
            }

            // Отменяем старую верификацию
            verification.status = 'expired';
            await verification.save();

            // Отправляем новый код
            return this.sendCode(req, res);

        } catch (error) {
            console.error('Resend SMS error:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка повторной отправки'
            });
        }
    }
}

module.exports = new SMSController();
