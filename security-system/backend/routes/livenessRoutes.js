/**
 * Liveness Routes
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const livenessController = require('../controllers/livenessController');

// Multer configuration for video upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024 // 50 MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Неподдерживаемый формат видео'));
        }
    }
});

// POST /api/liveness/upload - Загрузка видео
router.post('/upload', upload.single('video'), livenessController.uploadVideo.bind(livenessController));

// GET /api/liveness/status/:sessionId - Статус проверки
router.get('/status/:sessionId', livenessController.getStatus.bind(livenessController));

// POST /api/liveness/retry - Повторная попытка
router.post('/retry', livenessController.retry.bind(livenessController));

module.exports = router;
