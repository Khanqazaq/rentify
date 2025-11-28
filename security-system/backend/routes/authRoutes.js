/**
 * Auth Routes (опционально - для регистрации/входа)
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// POST /api/auth/register - Регистрация
router.post('/register', async (req, res) => {
    try {
        const { phone, name, password } = req.body;

        // Проверка существования
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Пользователь с таким номером уже существует'
            });
        }

        // Хеширование пароля
        const passwordHash = await bcrypt.hash(password, 12);

        // Создание пользователя
        const userId = `user_${Date.now()}`;
        const user = new User({
            userId,
            phone,
            name,
            passwordHash
        });

        await user.save();

        // Генерация токена
        const token = jwt.sign(
            { userId, phone },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
        );

        res.status(201).json({
            success: true,
            message: 'Регистрация успешна',
            data: {
                userId,
                token,
                user: {
                    userId,
                    name,
                    phone
                }
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка регистрации'
        });
    }
});

// POST /api/auth/login - Вход
router.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body;

        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Неверный номер или пароль'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Неверный номер или пароль'
            });
        }

        const token = jwt.sign(
            { userId: user.userId, phone: user.phone },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
        );

        res.json({
            success: true,
            message: 'Вход выполнен успешно',
            data: {
                token,
                user: {
                    userId: user.userId,
                    name: user.name,
                    phone: user.phone,
                    verification: user.verification,
                    rating: user.rating
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка входа'
        });
    }
});

module.exports = router;
