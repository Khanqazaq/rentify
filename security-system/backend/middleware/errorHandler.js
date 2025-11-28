/**
 * Error Handler Middleware
 * Централизованная обработка ошибок
 */

function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    // Multer errors (file upload)
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'Файл слишком большой',
            maxSize: '50MB для видео, 10MB для изображений'
        });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            success: false,
            message: 'Неожиданное поле файла'
        });
    }

    // Mongoose validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Ошибка валидации',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Запись с такими данными уже существует'
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Недействительный токен'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Токен истек'
        });
    }

    // Default error
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Внутренняя ошибка сервера',
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack
        })
    });
}

module.exports = errorHandler;
