/**
 * Authentication Middleware
 * Проверка JWT токена
 */

const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    try {
        // Получение токена из заголовка
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Токен не предоставлен'
            });
        }

        const token = authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Неверный формат токена'
            });
        }

        // Проверка токена
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Добавляем данные пользователя в req
        req.user = {
            userId: decoded.userId,
            phone: decoded.phone
        };

        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Токен истек'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Недействительный токен'
            });
        }

        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка аутентификации'
        });
    }
}

module.exports = authMiddleware;
