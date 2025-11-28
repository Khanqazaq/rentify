/**
 * ID Verification Routes
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const idController = require('../controllers/idController');

// Multer configuration for image upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB per file
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Неподдерживаемый формат изображения'));
        }
    }
});

// POST /api/id/upload - Загрузка документа
router.post('/upload', upload.fields([
    { name: 'front', maxCount: 1 },
    { name: 'back', maxCount: 1 }
]), idController.uploadDocument.bind(idController));

// GET /api/id/status/:verificationId - Статус проверки
router.get('/status/:verificationId', idController.getStatus.bind(idController));

// POST /api/id/manual-review - Ручная проверка (только для админов)
router.post('/manual-review', idController.manualReview.bind(idController));

module.exports = router;
