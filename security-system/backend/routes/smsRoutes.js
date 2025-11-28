/**
 * SMS Routes
 */

const express = require('express');
const router = express.Router();
const smsController = require('../controllers/smsController');

// POST /api/sms/send - Отправка SMS кода
router.post('/send', smsController.sendCode.bind(smsController));

// POST /api/sms/verify - Проверка SMS кода
router.post('/verify', smsController.verifyCode.bind(smsController));

// GET /api/sms/status/:userId - Статус верификации
router.get('/status/:userId', smsController.getStatus.bind(smsController));

// POST /api/sms/resend - Повторная отправка
router.post('/resend', smsController.resendCode.bind(smsController));

module.exports = router;
