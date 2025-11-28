/**
 * SMS Verification Frontend Logic
 */

const API_URL = 'http://localhost:3000/api';

class SMSVerification {
    constructor() {
        this.phone = '';
        this.verificationId = '';
        this.attemptsLeft = 3;
        this.countdownInterval = null;
        this.resendInterval = null;
        
        this.init();
    }

    init() {
        // Phone form submission
        document.getElementById('phone-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendCode();
        });

        // Code form submission
        document.getElementById('code-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.verifyCode();
        });

        // Code digit inputs
        const codeInputs = document.querySelectorAll('.code-digit');
        codeInputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                if (e.target.value.length === 1) {
                    if (index < codeInputs.length - 1) {
                        codeInputs[index + 1].focus();
                    }
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && e.target.value === '') {
                    if (index > 0) {
                        codeInputs[index - 1].focus();
                    }
                }
            });

            // Только цифры
            input.addEventListener('keypress', (e) => {
                if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                }
            });
        });

        // Resend button
        document.getElementById('resend-btn').addEventListener('click', () => {
            this.resendCode();
        });

        // Change phone button
        document.getElementById('change-phone-btn').addEventListener('click', () => {
            this.goToStep('step-phone');
            this.resetForm();
        });

        // Auto-focus first input
        document.getElementById('phone').focus();
    }

    async sendCode() {
        const phoneInput = document.getElementById('phone').value.trim();
        const sendBtn = document.getElementById('send-code-btn');
        
        if (!phoneInput || phoneInput.length !== 10) {
            this.showError('Введите корректный номер телефона (10 цифр)');
            return;
        }

        this.phone = '+7' + phoneInput;

        try {
            this.setButtonLoading(sendBtn, true);

            const userId = this.getUserId(); // Получаем из сессии

            const response = await fetch(`${API_URL}/sms/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    phone: this.phone,
                    userId
                })
            });

            const data = await response.json();

            if (data.success) {
                this.verificationId = data.data.verificationId;
                
                // Dev режим - показываем код в консоли
                if (data.data.code) {
                    console.log('🔑 Код верификации:', data.data.code);
                }

                this.goToStep('step-code');
                this.startCountdown(300); // 5 минут
                this.startResendTimer(60); // 60 секунд
                document.getElementById('phone-display').textContent = this.phone;
                
                // Фокус на первый input кода
                document.querySelector('.code-digit').focus();

                this.showSuccess('Код отправлен на ваш номер');
            } else {
                this.showError(data.message || 'Ошибка отправки кода');
            }

        } catch (error) {
            console.error('Send code error:', error);
            this.showError('Ошибка соединения с сервером');
        } finally {
            this.setButtonLoading(sendBtn, false);
        }
    }

    async verifyCode() {
        const codeInputs = document.querySelectorAll('.code-digit');
        const code = Array.from(codeInputs).map(input => input.value).join('');

        if (code.length !== 6) {
            this.showError('Введите полный код (6 цифр)');
            return;
        }

        const verifyBtn = document.getElementById('verify-code-btn');

        try {
            this.setButtonLoading(verifyBtn, true);

            const userId = this.getUserId();

            const response = await fetch(`${API_URL}/sms/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    verificationId: this.verificationId,
                    code,
                    userId
                })
            });

            const data = await response.json();

            if (data.success) {
                this.stopCountdown();
                this.goToStep('step-success');
                this.showSuccess('Телефон успешно подтвержден!');
                
                // Обновляем статус пользователя в localStorage
                this.updateUserVerificationStatus('phoneVerified', true);
                
                // Закрываем модальное окно через 2 секунды
                setTimeout(() => {
                    if (typeof window.closeVerificationModal === 'function') {
                        window.closeVerificationModal();
                    }
                }, 2000);

            } else {
                this.attemptsLeft--;
                document.getElementById('attempts-left').textContent = 
                    `Осталось попыток: ${this.attemptsLeft}`;

                if (this.attemptsLeft === 0) {
                    this.showError('Превышено количество попыток. Запросите новый код.');
                    this.goToStep('step-phone');
                    this.resetForm();
                } else {
                    this.showError(data.message || 'Неверный код');
                    // Очищаем поля кода
                    codeInputs.forEach(input => input.value = '');
                    codeInputs[0].focus();
                }
            }

        } catch (error) {
            console.error('Verify code error:', error);
            this.showError('Ошибка проверки кода');
        } finally {
            this.setButtonLoading(verifyBtn, false);
        }
    }

    async resendCode() {
        try {
            const response = await fetch(`${API_URL}/sms/resend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    verificationId: this.verificationId
                })
            });

            const data = await response.json();

            if (data.success) {
                this.verificationId = data.data.verificationId;
                this.attemptsLeft = 3;
                document.getElementById('attempts-left').textContent = 'Осталось попыток: 3';
                this.startCountdown(300);
                this.startResendTimer(60);
                this.showSuccess('Код отправлен повторно');
            } else {
                this.showError(data.message || 'Ошибка повторной отправки');
            }

        } catch (error) {
            console.error('Resend code error:', error);
            this.showError('Ошибка повторной отправки');
        }
    }

    startCountdown(seconds) {
        this.stopCountdown();
        
        let remaining = seconds;
        this.updateCountdownDisplay(remaining);

        this.countdownInterval = setInterval(() => {
            remaining--;
            this.updateCountdownDisplay(remaining);

            if (remaining <= 0) {
                this.stopCountdown();
                this.showError('Код истек. Запросите новый код.');
            }
        }, 1000);
    }

    stopCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }

    updateCountdownDisplay(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        document.getElementById('countdown').textContent = 
            `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    startResendTimer(seconds) {
        const resendBtn = document.getElementById('resend-btn');
        const resendTimerSpan = document.getElementById('resend-timer');
        
        resendBtn.disabled = true;
        let remaining = seconds;
        resendTimerSpan.textContent = remaining;

        this.resendInterval = setInterval(() => {
            remaining--;
            resendTimerSpan.textContent = remaining;

            if (remaining <= 0) {
                clearInterval(this.resendInterval);
                resendBtn.disabled = false;
                resendBtn.innerHTML = 'Отправить код повторно';
            }
        }, 1000);
    }

    goToStep(stepId) {
        document.querySelectorAll('.verification-step').forEach(step => {
            step.classList.remove('active');
        });
        document.getElementById(stepId).classList.add('active');
    }

    setButtonLoading(button, isLoading) {
        const btnText = button.querySelector('.btn-text');
        const btnLoader = button.querySelector('.btn-loader');
        
        if (isLoading) {
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-flex';
            button.disabled = true;
        } else {
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
            button.disabled = false;
        }
    }

    resetForm() {
        document.getElementById('phone').value = '';
        document.querySelectorAll('.code-digit').forEach(input => input.value = '');
        this.attemptsLeft = 3;
        this.stopCountdown();
    }

    showError(message) {
        // Простое уведомление (можно заменить на Toast)
        alert('❌ ' + message);
    }

    showSuccess(message) {
        // Простое уведомление (можно заменить на Toast)
        console.log('✅ ' + message);
    }

    getUserId() {
        // Получаем из localStorage или sessionStorage
        const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        return user.userId || 'guest_' + Date.now();
    }

    getAuthToken() {
        // Получаем JWT токен из localStorage
        return localStorage.getItem('authToken') || '';
    }

    updateUserVerificationStatus(field, value) {
        const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        if (!user.verification) user.verification = {};
        user.verification[field] = value;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new SMSVerification();
});

// Функция для закрытия модального окна (вызывается из index.html)
window.closeVerificationModal = function() {
    // Логика закрытия модального окна
    const modal = document.querySelector('.verification-container');
    if (modal) {
        modal.style.display = 'none';
    }
};
