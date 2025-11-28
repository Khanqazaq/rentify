/**
 * Models Export
 * Централизованный экспорт всех моделей
 */

const mongoose = require('mongoose');

// Импорт схем
const schemas = require('../database/mongodb/schemas');

module.exports = {
    User: schemas.User,
    SMSVerification: schemas.SMSVerification,
    LivenessCheck: schemas.LivenessCheck,
    IDVerification: schemas.IDVerification,
    Review: schemas.Review,
    Transaction: schemas.Transaction
};
