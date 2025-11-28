/**
 * ID Verification Controller
 * Сканирование и проверка документов удостоверяющих личность
 */

const crypto = require('crypto');
const { IDVerification, User, LivenessCheck } = require('../models');
const ocrService = require('../services/ocrService');
const storageService = require('../services/storageService');
const livenessService = require('../services/livenessService');

class IDController {

    /**
     * Загрузка фото документа
     * POST /api/id/upload
     */
    async uploadDocument(req, res) {
        try {
            const { userId, documentType } = req.body;
            const frontImage = req.files?.front?.[0];
            const backImage = req.files?.back?.[0];

            if (!frontImage) {
                return res.status(400).json({
                    success: false,
                    message: 'Не загружена фотография лицевой стороны документа'
                });
            }

            const allowedTypes = ['id_card', 'passport', 'driving_license'];
            if (!allowedTypes.includes(documentType)) {
                return res.status(400).json({
                    success: false,
                    message: 'Неподдерживаемый тип документа'
                });
            }

            // Валидация изображений
            const maxSize = 10 * 1024 * 1024; // 10 MB
            if (frontImage.size > maxSize || (backImage && backImage.size > maxSize)) {
                return res.status(400).json({
                    success: false,
                    message: 'Размер изображения превышает 10 МБ'
                });
            }

            const verificationId = `id_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

            // Загрузка изображений в облако
            let frontImageUrl, frontImageHash, backImageUrl, backImageHash;
            
            try {
                const frontUpload = await storageService.uploadImage(frontImage, userId, 'id-front');
                frontImageUrl = frontUpload.url;
                frontImageHash = frontUpload.hash;

                if (backImage) {
                    const backUpload = await storageService.uploadImage(backImage, userId, 'id-back');
                    backImageUrl = backUpload.url;
                    backImageHash = backUpload.hash;
                }
            } catch (uploadError) {
                console.error('Image upload error:', uploadError);
                return res.status(500).json({
                    success: false,
                    message: 'Ошибка загрузки изображений'
                });
            }

            // Создание записи
            const verification = new IDVerification({
                verificationId,
                userId,
                documentType,
                frontImageUrl,
                frontImageHash,
                backImageUrl,
                backImageHash,
                ocrProvider: process.env.OCR_PROVIDER || 'regula',
                ipAddress: req.ip,
                deviceInfo: req.headers['user-agent'],
                status: 'pending'
            });

            await verification.save();

            // Запуск асинхронной обработки
            this.processDocument(verificationId).catch(err => {
                console.error('Document processing error:', err);
            });

            res.status(200).json({
                success: true,
                message: 'Документ загружен. Начата проверка.',
                data: {
                    verificationId,
                    status: 'processing'
                }
            });

        } catch (error) {
            console.error('Upload ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Внутренняя ошибка сервера'
            });
        }
    }

    /**
     * Асинхронная обработка документа
     */
    async processDocument(verificationId) {
        try {
            const verification = await IDVerification.findOne({ verificationId });
            if (!verification) {
                throw new Error('Verification not found');
            }

            verification.status = 'processing';
            await verification.save();

            // 1. OCR - извлечение текста из документа
            const ocrResult = await ocrService.extractData({
                frontImageUrl: verification.frontImageUrl,
                backImageUrl: verification.backImageUrl,
                documentType: verification.documentType,
                provider: verification.ocrProvider
            });

            verification.ocrData = ocrResult.data;
            verification.ocrConfidence = ocrResult.confidence;

            // Маскирование ИИН
            if (ocrResult.data.iin) {
                verification.ocrData.iinMasked = this.maskIIN(ocrResult.data.iin);
            }

            // 2. Проверка подлинности документа
            verification.documentChecks = {
                mrzValid: ocrResult.checks?.mrzValid || false,
                barcodeValid: ocrResult.checks?.barcodeValid || false,
                hologramDetected: ocrResult.checks?.hologramDetected || false,
                tamperDetected: ocrResult.checks?.tamperDetected || false,
                photocopyDetected: ocrResult.checks?.photocopyDetected || false
            };

            // 3. Сравнение лица (ID фото vs селфи из liveness)
            const livenessCheck = await LivenessCheck.findOne({
                userId: verification.userId,
                status: 'passed'
            }).sort({ createdAt: -1 });

            if (livenessCheck && livenessCheck.videoUrl) {
                try {
                    // Извлекаем кадр из видео для сравнения
                    const faceCompareResult = await livenessService.compareFaces(
                        verification.frontImageUrl, // Фото из ID
                        livenessCheck.videoUrl // Селфи-видео (используем первый кадр)
                    );

                    verification.faceMatch = {
                        confidence: faceCompareResult.confidence,
                        matched: faceCompareResult.matched,
                        livenessSessionId: livenessCheck.sessionId
                    };
                } catch (faceError) {
                    console.error('Face comparison error:', faceError);
                    verification.faceMatch = {
                        confidence: 0,
                        matched: false
                    };
                }
            }

            // Определение прохождения
            const passed = this.determineVerificationPassed(verification);
            
            verification.passed = passed;
            verification.status = passed ? 'approved' : 
                                 (verification.ocrConfidence < 70 ? 'manual_review' : 'rejected');
            
            if (!passed) {
                verification.rejectionReason = this.getRejectionReason(verification);
            }

            verification.processedAt = new Date();
            await verification.save();

            // Обновление пользователя при успехе
            if (passed) {
                await User.findOneAndUpdate(
                    { userId: verification.userId },
                    {
                        $set: {
                            'verification.idVerified': true,
                            'verification.idVerifiedAt': new Date(),
                            'verification.idType': verification.documentType,
                            'verification.isFullyVerified': true,
                            'verification.verificationLevel': 3
                        },
                        $push: {
                            badges: {
                                type: 'id_verified',
                                earnedAt: new Date()
                            }
                        }
                    }
                );

                console.log(`ID verified for user ${verification.userId}`);
            }

        } catch (error) {
            console.error('Process ID document error:', error);
            
            await IDVerification.findOneAndUpdate(
                { verificationId },
                {
                    status: 'manual_review',
                    rejectionReason: `Ошибка обработки: ${error.message}`
                }
            );
        }
    }

    /**
     * Маскирование ИИН (показываем только последние 4 цифры)
     */
    maskIIN(iin) {
        if (!iin || iin.length !== 12) return iin;
        return '*'.repeat(8) + iin.slice(-4);
    }

    /**
     * Определение прохождения верификации
     */
    determineVerificationPassed(verification) {
        // Минимальные требования
        if (verification.ocrConfidence < 70) return false;
        if (!verification.ocrData?.fullName) return false;
        if (!verification.ocrData?.iin) return false;
        if (verification.documentChecks?.tamperDetected) return false;
        if (verification.documentChecks?.photocopyDetected) return false;

        // Проверка соответствия лица (если есть liveness)
        if (verification.faceMatch) {
            if (!verification.faceMatch.matched) return false;
            if (verification.faceMatch.confidence < 75) return false;
        }

        return true;
    }

    /**
     * Причина отказа
     */
    getRejectionReason(verification) {
        if (verification.ocrConfidence < 70) {
            return 'Низкое качество изображения документа. Пожалуйста, сделайте более четкое фото.';
        }
        if (verification.documentChecks?.tamperDetected) {
            return 'Обнаружены признаки подделки документа.';
        }
        if (verification.documentChecks?.photocopyDetected) {
            return 'Обнаружена копия документа. Требуется оригинал.';
        }
        if (verification.faceMatch && !verification.faceMatch.matched) {
            return 'Фото на документе не совпадает с селфи-видео.';
        }
        if (!verification.ocrData?.fullName || !verification.ocrData?.iin) {
            return 'Не удалось распознать данные документа.';
        }
        return 'Документ не прошел проверку.';
    }

    /**
     * Получение статуса верификации
     * GET /api/id/status/:verificationId
     */
    async getStatus(req, res) {
        try {
            const { verificationId } = req.params;

            const verification = await IDVerification.findOne({ verificationId });

            if (!verification) {
                return res.status(404).json({
                    success: false,
                    message: 'Верификация не найдена'
                });
            }

            res.status(200).json({
                success: true,
                data: {
                    verificationId: verification.verificationId,
                    status: verification.status,
                    passed: verification.passed,
                    documentType: verification.documentType,
                    ocrData: {
                        fullName: verification.ocrData?.fullName,
                        iinMasked: verification.ocrData?.iinMasked,
                        dateOfBirth: verification.ocrData?.dateOfBirth,
                        documentNumber: verification.ocrData?.documentNumber
                    },
                    ocrConfidence: verification.ocrConfidence,
                    faceMatch: verification.faceMatch,
                    rejectionReason: verification.rejectionReason,
                    processedAt: verification.processedAt
                }
            });

        } catch (error) {
            console.error('Get ID status error:', error);
            res.status(500).json({
                success: false,
                message: 'Внутренняя ошибка сервера'
            });
        }
    }

    /**
     * Ручная проверка (для админов)
     * POST /api/id/manual-review
     */
    async manualReview(req, res) {
        try {
            const { verificationId, approved, notes, adminId } = req.body;

            const verification = await IDVerification.findOne({ verificationId });

            if (!verification) {
                return res.status(404).json({
                    success: false,
                    message: 'Верификация не найдена'
                });
            }

            verification.status = approved ? 'approved' : 'rejected';
            verification.passed = approved;
            verification.reviewedBy = adminId;
            verification.reviewedAt = new Date();
            verification.reviewNotes = notes;

            if (!approved && !verification.rejectionReason) {
                verification.rejectionReason = notes;
            }

            await verification.save();

            // Обновление пользователя
            if (approved) {
                await User.findOneAndUpdate(
                    { userId: verification.userId },
                    {
                        $set: {
                            'verification.idVerified': true,
                            'verification.idVerifiedAt': new Date(),
                            'verification.isFullyVerified': true,
                            'verification.verificationLevel': 3
                        }
                    }
                );
            }

            res.status(200).json({
                success: true,
                message: approved ? 'Документ одобрен' : 'Документ отклонен',
                data: {
                    verificationId,
                    status: verification.status
                }
            });

        } catch (error) {
            console.error('Manual review error:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка ручной проверки'
            });
        }
    }
}

module.exports = new IDController();
