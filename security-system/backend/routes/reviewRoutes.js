/**
 * Reviews Routes
 */

const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// POST /api/reviews/create - Создание отзыва
router.post('/create', reviewController.createReview.bind(reviewController));

// GET /api/reviews/:userId - Получение отзывов пользователя
router.get('/:userId', reviewController.getUserReviews.bind(reviewController));

// GET /api/ratings/user/:userId - Получение рейтинга пользователя
router.get('/ratings/user/:userId', reviewController.getUserRating.bind(reviewController));

// POST /api/reviews/respond - Ответ на отзыв
router.post('/respond', reviewController.respondToReview.bind(reviewController));

module.exports = router;
