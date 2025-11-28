/**
 * User Routes
 */

const express = require('express');
const router = express.Router();
const { User } = require('../models');

// GET /api/users/:userId - Получение профиля пользователя
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        res.json({
            success: true,
            data: {
                userId: user.userId,
                name: user.name,
                phone: user.phone,
                verification: user.verification,
                rating: user.rating,
                trustScore: user.trustScore,
                badges: user.badges,
                stats: user.stats
            }
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения данных'
        });
    }
});

module.exports = router;
