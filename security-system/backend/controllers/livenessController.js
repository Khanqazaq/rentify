/**
 * Liveness Check Controller
 * AI-верификация живости пользователя через видео-селфи
 */

const crypto = require('crypto');
const { LivenessCheck, User } = require('../models');
const livenessService = require('../services/livenessService');
const storageService = require('../services/storageService');

class LivenessController {

    /**
     * Загрузка видео для проверки
     * POST /api/liveness/upload
     */
    async uploadVideo(req, res) {
        try {
            const { userId } = req.body;
            const videoFile = req.file; // Multer middleware

            if (!videoFile) {
                return res.status(400).json({
                    success: false,
                    message: 'Видео файл не загружен'
                });
            }

            // Валидация видео
            const maxSize = 50 * 1024 * 1024; // 50 MB
            if (videoFile.size > maxSize) {
                return res.status(400).json({
                    success: false,
                    message: 'Размер видео превышает 50 МБ'
                });
            }

            const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
            if (!allowedTypes.includes(videoFile.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: 'Неподдерживаемый формат видео. Используйте MP4, WebM или MOV'
                });
            }

            // Создание сессии liveness
            const sessionId = `liveness_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
            
            // Загрузка в облако (S3/Firebase Storage)
            let videoUrl, videoHash;
            try {
                const uploadResult = await storageService.uploadVideo(videoFile, userId);
                videoUrl = uploadResult.url;
                videoHash = uploadResult.hash;
            } catch (uploadError) {
                console.error('Video upload error:', uploadError);
                return res.status(500).json({
                    success: false,
                    message: 'Ошибка загрузки видео'
                });
            }

            // Создание записи в БД
            const livenessCheck = new LivenessCheck({
                sessionId,
                userId,
                videoUrl,
                videoHash,
                videoDuration: videoFile.duration || 0,
                aiProvider: process.env.LIVENESS_AI_PROVIDER || 'facepp',
                ipAddress: req.ip,
                deviceInfo: req.headers['user-agent'],
                status: 'pending'
            });

            await livenessCheck.save();

            // Запуск асинхронной проверки
            this.processLiveness(sessionId).catch(err => {
                console.error('Liveness processing error:', err);
            });

            res.status(200).json({
                success: true,
                message: 'Видео загружено. Начата обработка.',
                data: {
                    sessionId,
                    status: 'processing'
                }
            });

        } catch (error) {
            console.error('Upload liveness video error:', error);
            res.status(500).json({
                success: false,
                message: 'Внутренняя ошибка сервера'
            });
        }
    }

    /**
     * Асинхронная обработка liveness проверки
     */
    async processLiveness(sessionId) {
        try {
            const check = await LivenessCheck.findOne({ sessionId });
            if (!check) {
                throw new Error('Liveness session not found');
            }

            check.status = 'processing';
            await check.save();

            // Отправка в AI сервис
            const aiResult = await livenessService.analyzeVideo({
                videoUrl: check.videoUrl,
                provider: check.aiProvider
            });

            // Обновление результатов
            check.livenessScore = aiResult.livenessScore;
            check.faceDetected = aiResult.faceDetected;
            check.faceQuality = aiResult.faceQuality;
            
            check.checks = {
                eyeMovement: aiResult.checks.eyeMovement,
                headRotation: aiResult.checks.headRotation,
                blinkDetected: aiResult.checks.blinkDetected,
                lipMovement: aiResult.checks.lipMovement,
                depthDetected: aiResult.checks.depthDetected,
                screenDetection: aiResult.checks.screenDetection
            };

            // Определение прохождения
            const threshold = 70; // Минимальный score для прохождения
            check.passed = aiResult.livenessScore >= threshold && 
                           aiResult.faceDetected && 
                           !aiResult.checks.screenDetection;

            check.status = check.passed ? 'passed' : 'failed';
            
            if (!check.passed) {
                check.failureReason = this.getFailureReason(aiResult);
            }

            check.processedAt = new Date();
            await check.save();

            // Если прошел - обновить пользователя
            if (check.passed) {
                await User.findOneAndUpdate(
                    { userId: check.userId },
                    {
                        $set: {
                            'verification.livenessVerified': true,
                            'verification.livenessVerifiedAt': new Date(),
                            'verification.livenessScore': aiResult.livenessScore,
                            'verification.verificationLevel': 2
                        },
                        $push: {
                            badges: {
                                type: 'liveness_verified',
                                earnedAt: new Date()
                            }
                        }
                    }
                );

                console.log(`Liveness passed for user ${check.userId}, score: ${aiResult.livenessScore}`);
            }

            // Удаление видео через 24 часа (для безопасности)
            setTimeout(async () => {
                await storageService.deleteVideo(check.videoUrl);
                check.videoUrl = null;
                await check.save();
            }, 24 * 60 * 60 * 1000);

        } catch (error) {
            console.error('Process liveness error:', error);
            
            await LivenessCheck.findOneAndUpdate(
                { sessionId },
                {
                    status: 'error',
                    failureReason: error.message
                }
            );
        }
    }

    /**
     * Определение причины отказа
     */
    getFailureReason(aiResult) {
        if (!aiResult.faceDetected) {
            return 'Лицо не обнаружено на видео';
        }
        if (aiResult.faceQuality < 50) {
            return 'Низкое качество видео или освещения';
        }
        if (aiResult.checks.screenDetection) {
            return 'Обнаружена попытка использования фото/видео с экрана';
        }
        if (aiResult.livenessScore < 70) {
            return 'Недостаточно движений для подтверждения живости';
        }
        return 'Проверка не пройдена';
    }

    /**
     * Получение статуса проверки
     * GET /api/liveness/status/:sessionId
     */
    async getStatus(req, res) {
        try {
            const { sessionId } = req.params;

            const check = await LivenessCheck.findOne({ sessionId });

            if (!check) {
                return res.status(404).json({
                    success: false,
                    message: 'Сессия не найдена'
                });
            }

            res.status(200).json({
                success: true,
                data: {
                    sessionId: check.sessionId,
                    status: check.status,
                    passed: check.passed,
                    livenessScore: check.livenessScore,
                    faceQuality: check.faceQuality,
                    checks: check.checks,
                    failureReason: check.failureReason,
                    processedAt: check.processedAt
                }
            });

        } catch (error) {
            console.error('Get liveness status error:', error);
            res.status(500).json({
                success: false,
                message: 'Внутренняя ошибка сервера'
            });
        }
    }

    /**
     * Повторная попытка
     * POST /api/liveness/retry
     */
    async retry(req, res) {
        try {
            const { sessionId } = req.body;

            const check = await LivenessCheck.findOne({ sessionId });

            if (!check) {
                return res.status(404).json({
                    success: false,
                    message: 'Сессия не найдена'
                });
            }

            if (check.status === 'processing') {
                return res.status(400).json({
                    success: false,
                    message: 'Проверка уже в процессе'
                });
            }

            // Запуск повторной обработки
            await this.processLiveness(sessionId);

            res.status(200).json({
                success: true,
                message: 'Повторная проверка запущена'
            });

        } catch (error) {
            console.error('Retry liveness error:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка повторной проверки'
            });
        }
    }
}

module.exports = new LivenessController();
