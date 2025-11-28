/**
 * Reviews & Rating Controller
 * Система отзывов, рейтингов и расчета уровня доверия
 */

const crypto = require('crypto');
const { Review, Transaction, User } = require('../models');

class ReviewController {

    /**
     * Создание отзыва
     * POST /api/reviews/create
     */
    async createReview(req, res) {
        try {
            const {
                reviewerId,
                revieweeId,
                transactionId,
                rating,
                comment,
                detailedRating,
                tags
            } = req.body;

            // Валидация
            if (!reviewerId || !revieweeId || !transactionId || !rating) {
                return res.status(400).json({
                    success: false,
                    message: 'Не указаны обязательные поля'
                });
            }

            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Рейтинг должен быть от 1 до 5'
                });
            }

            // Проверка существования транзакции
            const transaction = await Transaction.findOne({ transactionId });
            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    message: 'Транзакция не найдена'
                });
            }

            // Проверка статуса транзакции
            if (transaction.status !== 'completed') {
                return res.status(400).json({
                    success: false,
                    message: 'Можно оставлять отзыв только после завершения сделки'
                });
            }

            // Проверка участия в транзакции
            const isOwner = transaction.ownerId === reviewerId;
            const isRenter = transaction.renterId === reviewerId;

            if (!isOwner && !isRenter) {
                return res.status(403).json({
                    success: false,
                    message: 'Вы не участвовали в этой сделке'
                });
            }

            // Проверка на дубликат отзыва
            const existingReview = await Review.findOne({
                reviewerId,
                transactionId
            });

            if (existingReview) {
                return res.status(400).json({
                    success: false,
                    message: 'Вы уже оставили отзыв по этой сделке'
                });
            }

            // Получение информации о пользователях
            const reviewer = await User.findOne({ userId: reviewerId });
            const reviewee = await User.findOne({ userId: revieweeId });

            if (!reviewer || !reviewee) {
                return res.status(404).json({
                    success: false,
                    message: 'Пользователь не найден'
                });
            }

            // Определение роли reviewee в сделке
            const role = transaction.ownerId === revieweeId ? 'owner' : 'renter';

            // Создание отзыва
            const reviewId = `review_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

            const review = new Review({
                reviewId,
                reviewerId,
                reviewerName: reviewer.name,
                revieweeId,
                revieweeName: reviewee.name,
                transactionId,
                itemId: transaction.itemId,
                itemName: transaction.itemName,
                role,
                rating,
                comment,
                detailedRating: detailedRating || {},
                tags: tags || []
            });

            await review.save();

            // Обновление транзакции
            if (isOwner) {
                transaction.reviews.ownerReviewed = true;
            } else {
                transaction.reviews.renterReviewed = true;
            }
            await transaction.save();

            // Пересчет рейтинга пользователя
            await this.recalculateUserRating(revieweeId, role);

            // Пересчет Trust Score
            await this.recalculateTrustScore(revieweeId);

            // Проверка и выдача бейджей
            await this.checkAndAwardBadges(revieweeId);

            res.status(201).json({
                success: true,
                message: 'Отзыв успешно создан',
                data: {
                    reviewId,
                    rating
                }
            });

        } catch (error) {
            console.error('Create review error:', error);
            res.status(500).json({
                success: false,
                message: 'Внутренняя ошибка сервера'
            });
        }
    }

    /**
     * Получение отзывов пользователя
     * GET /api/reviews/:userId
     */
    async getUserReviews(req, res) {
        try {
            const { userId } = req.params;
            const { page = 1, limit = 10, role } = req.query;

            const query = { revieweeId: userId, isPublic: true };
            if (role) {
                query.role = role;
            }

            const reviews = await Review.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(Number(limit));

            const total = await Review.countDocuments(query);

            res.status(200).json({
                success: true,
                data: {
                    reviews,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });

        } catch (error) {
            console.error('Get reviews error:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка получения отзывов'
            });
        }
    }

    /**
     * Получение рейтинга пользователя
     * GET /api/ratings/user/:userId
     */
    async getUserRating(req, res) {
        try {
            const { userId } = req.params;

            const user = await User.findOne({ userId });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Пользователь не найден'
                });
            }

            // Получение статистики отзывов
            const reviewStats = await this.getReviewStatistics(userId);

            res.status(200).json({
                success: true,
                data: {
                    userId,
                    name: user.name,
                    rating: user.rating,
                    trustScore: user.trustScore,
                    badges: user.badges,
                    verification: {
                        phoneVerified: user.verification.phoneVerified,
                        livenessVerified: user.verification.livenessVerified,
                        idVerified: user.verification.idVerified,
                        isFullyVerified: user.verification.isFullyVerified,
                        verificationLevel: user.verification.verificationLevel
                    },
                    stats: user.stats,
                    reviewStats
                }
            });

        } catch (error) {
            console.error('Get rating error:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка получения рейтинга'
            });
        }
    }

    /**
     * Пересчет рейтинга пользователя
     */
    async recalculateUserRating(userId, role) {
        try {
            // Все отзывы о пользователе
            const allReviews = await Review.find({
                revieweeId: userId,
                isPublic: true
            });

            if (allReviews.length === 0) return;

            // Общий средний рейтинг
            const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

            // Рейтинг по ролям
            const ownerReviews = allReviews.filter(r => r.role === 'owner');
            const renterReviews = allReviews.filter(r => r.role === 'renter');

            const ownerAvg = ownerReviews.length > 0 
                ? ownerReviews.reduce((sum, r) => sum + r.rating, 0) / ownerReviews.length 
                : 0;

            const renterAvg = renterReviews.length > 0 
                ? renterReviews.reduce((sum, r) => sum + r.rating, 0) / renterReviews.length 
                : 0;

            // Обновление пользователя
            await User.findOneAndUpdate(
                { userId },
                {
                    $set: {
                        'rating.average': Number(avgRating.toFixed(2)),
                        'rating.count': allReviews.length,
                        'rating.asOwner.average': Number(ownerAvg.toFixed(2)),
                        'rating.asOwner.count': ownerReviews.length,
                        'rating.asRenter.average': Number(renterAvg.toFixed(2)),
                        'rating.asRenter.count': renterReviews.length
                    }
                }
            );

            console.log(`Rating updated for user ${userId}: ${avgRating.toFixed(2)}`);

        } catch (error) {
            console.error('Recalculate rating error:', error);
        }
    }

    /**
     * Расчет уровня доверия (Trust Score)
     * Алгоритм: верификация + рейтинг + активность + опыт
     */
    async recalculateTrustScore(userId) {
        try {
            const user = await User.findOne({ userId });
            if (!user) return;

            let trustScore = 0;

            // 1. Верификация (до 40 баллов)
            if (user.verification.phoneVerified) trustScore += 10;
            if (user.verification.livenessVerified) trustScore += 15;
            if (user.verification.idVerified) trustScore += 15;

            // 2. Рейтинг (до 30 баллов)
            const ratingScore = (user.rating.average / 5) * 30;
            trustScore += ratingScore;

            // 3. Количество отзывов (до 15 баллов)
            const reviewsScore = Math.min(user.rating.count * 1.5, 15);
            trustScore += reviewsScore;

            // 4. Количество завершенных сделок (до 15 баллов)
            const transactionsScore = Math.min(user.stats.completedTransactions * 0.5, 15);
            trustScore += transactionsScore;

            // Округление
            trustScore = Math.min(100, Math.max(0, Math.round(trustScore)));

            await User.findOneAndUpdate(
                { userId },
                { $set: { trustScore } }
            );

            console.log(`Trust score updated for user ${userId}: ${trustScore}`);

            return trustScore;

        } catch (error) {
            console.error('Recalculate trust score error:', error);
        }
    }

    /**
     * Проверка и выдача бейджей
     */
    async checkAndAwardBadges(userId) {
        try {
            const user = await User.findOne({ userId });
            if (!user) return;

            const newBadges = [];

            // Trusted Owner (рейтинг как владелец >= 4.5, минимум 5 сделок)
            if (user.rating.asOwner.average >= 4.5 && 
                user.rating.asOwner.count >= 5 &&
                !user.badges.some(b => b.type === 'trusted_owner')) {
                newBadges.push({
                    type: 'trusted_owner',
                    earnedAt: new Date()
                });
            }

            // Trusted Renter (рейтинг как арендатор >= 4.5, минимум 5 сделок)
            if (user.rating.asRenter.average >= 4.5 && 
                user.rating.asRenter.count >= 5 &&
                !user.badges.some(b => b.type === 'trusted_renter')) {
                newBadges.push({
                    type: 'trusted_renter',
                    earnedAt: new Date()
                });
            }

            // Superhero (50+ завершенных сделок)
            if (user.stats.completedTransactions >= 50 &&
                !user.badges.some(b => b.type === 'superhero')) {
                newBadges.push({
                    type: 'superhero',
                    earnedAt: new Date()
                });
            }

            // Добавление бейджей
            if (newBadges.length > 0) {
                await User.findOneAndUpdate(
                    { userId },
                    {
                        $push: {
                            badges: { $each: newBadges }
                        }
                    }
                );

                console.log(`Awarded ${newBadges.length} badge(s) to user ${userId}`);
            }

        } catch (error) {
            console.error('Award badges error:', error);
        }
    }

    /**
     * Статистика отзывов
     */
    async getReviewStatistics(userId) {
        try {
            const reviews = await Review.find({
                revieweeId: userId,
                isPublic: true
            });

            if (reviews.length === 0) {
                return {
                    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                    topTags: [],
                    avgDetailedRatings: {}
                };
            }

            // Распределение оценок
            const distribution = reviews.reduce((acc, r) => {
                acc[r.rating] = (acc[r.rating] || 0) + 1;
                return acc;
            }, {});

            // Популярные теги
            const tagsCount = {};
            reviews.forEach(r => {
                r.tags.forEach(tag => {
                    tagsCount[tag] = (tagsCount[tag] || 0) + 1;
                });
            });

            const topTags = Object.entries(tagsCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([tag, count]) => ({ tag, count }));

            // Средние детальные оценки
            const detailedRatings = reviews
                .filter(r => r.detailedRating)
                .reduce((acc, r) => {
                    Object.entries(r.detailedRating).forEach(([key, value]) => {
                        if (!acc[key]) acc[key] = { sum: 0, count: 0 };
                        acc[key].sum += value;
                        acc[key].count += 1;
                    });
                    return acc;
                }, {});

            const avgDetailedRatings = {};
            Object.entries(detailedRatings).forEach(([key, { sum, count }]) => {
                avgDetailedRatings[key] = Number((sum / count).toFixed(2));
            });

            return {
                distribution,
                topTags,
                avgDetailedRatings
            };

        } catch (error) {
            console.error('Get review statistics error:', error);
            return {};
        }
    }

    /**
     * Ответ на отзыв (от reviewee)
     * POST /api/reviews/respond
     */
    async respondToReview(req, res) {
        try {
            const { reviewId, userId, response } = req.body;

            const review = await Review.findOne({ reviewId });
            
            if (!review) {
                return res.status(404).json({
                    success: false,
                    message: 'Отзыв не найден'
                });
            }

            if (review.revieweeId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Вы можете отвечать только на отзывы о себе'
                });
            }

            if (review.response && review.response.text) {
                return res.status(400).json({
                    success: false,
                    message: 'Ответ уже существует'
                });
            }

            review.response = {
                text: response,
                respondedAt: new Date()
            };

            await review.save();

            res.status(200).json({
                success: true,
                message: 'Ответ добавлен'
            });

        } catch (error) {
            console.error('Respond to review error:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка добавления ответа'
            });
        }
    }
}

module.exports = new ReviewController();
