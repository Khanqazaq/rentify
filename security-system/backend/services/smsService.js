/**
 * SMS Service - Интеграция с провайдерами
 * Поддержка: Twilio, SMSC.ru, Firebase
 */

const axios = require('axios');

class SMSService {
    constructor() {
        this.provider = process.env.SMS_PROVIDER || 'smsc';
        this.config = {
            twilio: {
                accountSid: process.env.TWILIO_ACCOUNT_SID,
                authToken: process.env.TWILIO_AUTH_TOKEN,
                from: process.env.TWILIO_PHONE_NUMBER
            },
            smsc: {
                login: process.env.SMSC_LOGIN,
                password: process.env.SMSC_PASSWORD,
                sender: process.env.SMSC_SENDER || 'Rentify'
            },
            firebase: {
                // Firebase использует client-side Auth, здесь не нужен
            }
        };
    }

    /**
     * Отправка кода верификации
     */
    async sendVerificationCode(phone, code) {
        const message = `Ваш код подтверждения Rentify: ${code}. Действителен 5 минут.`;

        switch (this.provider) {
            case 'twilio':
                return this.sendViaTwilio(phone, message);
            case 'smsc':
                return this.sendViaSMSC(phone, message);
            case 'test':
                return this.sendViaTest(phone, code);
            default:
                throw new Error(`Unknown SMS provider: ${this.provider}`);
        }
    }

    /**
     * Twilio провайдер
     */
    async sendViaTwilio(phone, message) {
        try {
            const twilio = require('twilio');
            const client = twilio(
                this.config.twilio.accountSid,
                this.config.twilio.authToken
            );

            const result = await client.messages.create({
                body: message,
                from: this.config.twilio.from,
                to: phone
            });

            return {
                success: true,
                messageId: result.sid,
                status: result.status
            };
        } catch (error) {
            console.error('Twilio error:', error);
            throw new Error(`Twilio SMS failed: ${error.message}`);
        }
    }

    /**
     * SMSC.ru провайдер (для Казахстана/России)
     */
    async sendViaSMSC(phone, message) {
        try {
            const url = 'https://smsc.ru/sys/send.php';
            
            const params = {
                login: this.config.smsc.login,
                psw: this.config.smsc.password,
                phones: phone.replace('+', ''),
                mes: message,
                sender: this.config.smsc.sender,
                charset: 'utf-8',
                fmt: 3 // JSON format
            };

            const response = await axios.get(url, { params });

            if (response.data.error) {
                throw new Error(response.data.error);
            }

            return {
                success: true,
                messageId: response.data.id,
                count: response.data.cnt
            };
        } catch (error) {
            console.error('SMSC error:', error);
            throw new Error(`SMSC SMS failed: ${error.message}`);
        }
    }

    /**
     * Test провайдер (для разработки)
     */
    async sendViaTest(phone, code) {
        console.log('='.repeat(50));
        console.log(`📱 TEST SMS to ${phone}`);
        console.log(`🔑 Code: ${code}`);
        console.log('='.repeat(50));

        return {
            success: true,
            messageId: `test_${Date.now()}`,
            code // Возвращаем код для тестирования
        };
    }

    /**
     * Проверка статуса доставки SMS
     */
    async getDeliveryStatus(messageId) {
        switch (this.provider) {
            case 'twilio':
                return this.getTwilioStatus(messageId);
            case 'smsc':
                return this.getSMSCStatus(messageId);
            default:
                return { status: 'unknown' };
        }
    }

    /**
     * Twilio статус
     */
    async getTwilioStatus(messageId) {
        try {
            const twilio = require('twilio');
            const client = twilio(
                this.config.twilio.accountSid,
                this.config.twilio.authToken
            );

            const message = await client.messages(messageId).fetch();
            
            return {
                status: message.status,
                errorCode: message.errorCode,
                errorMessage: message.errorMessage
            };
        } catch (error) {
            return { status: 'error', error: error.message };
        }
    }

    /**
     * SMSC.ru статус
     */
    async getSMSCStatus(messageId) {
        try {
            const url = 'https://smsc.ru/sys/status.php';
            
            const params = {
                login: this.config.smsc.login,
                psw: this.config.smsc.password,
                phone: messageId,
                id: messageId,
                fmt: 3
            };

            const response = await axios.get(url, { params });
            
            return {
                status: response.data.status,
                lastDate: response.data.last_date,
                lastTimestamp: response.data.last_timestamp
            };
        } catch (error) {
            return { status: 'error', error: error.message };
        }
    }
}

module.exports = new SMSService();
