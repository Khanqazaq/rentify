// ========== NOTIFICATION SYSTEM ==========

// Notification container
let notificationContainer = null;

// Initialize notification container
function initNotifications() {
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
        `;
        document.body.appendChild(notificationContainer);
    }
}

// Show notification
function showNotification(message, type = 'info', duration = 5000) {
    initNotifications();

    const notification = document.createElement('div');
    notification.className = 'notification';
    
    // Icon based on type
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
        message: '💬'
    };

    // Colors based on type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
        message: '#8b5cf6'
    };

    const icon = icons[type] || icons.info;
    const color = colors[type] || colors.info;

    notification.style.cssText = `
        background: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        animation: slideIn 0.3s ease-out;
        border-left: 4px solid ${color};
    `;

    notification.innerHTML = `
        <div style="width: 32px; height: 32px; border-radius: 50%; background: ${color}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; flex-shrink: 0;">
            ${icon}
        </div>
        <div style="flex: 1; color: #111; font-size: 14px;">
            ${message}
        </div>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: #999; cursor: pointer; font-size: 20px; padding: 0; width: 24px; height: 24px; flex-shrink: 0;">
            ×
        </button>
    `;

    notificationContainer.appendChild(notification);

    // Auto remove after duration
    if (duration > 0) {
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    return notification;
}

// Add animation styles
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }

        @media (max-width: 768px) {
            #notification-container {
                top: 10px;
                right: 10px;
                left: 10px;
                max-width: none;
            }
            
            .notification {
                min-width: auto !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// Notification badge for unread messages
function updateMessageBadge(count) {
    const badge = document.getElementById('message-badge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Get unread messages count
function getUnreadMessagesCount() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    if (!currentUser.phone) return 0;

    const chats = JSON.parse(localStorage.getItem('chats') || '{}');
    const readMessages = JSON.parse(localStorage.getItem('readMessages') || '{}');
    
    let unreadCount = 0;
    
    Object.keys(chats).forEach(chatKey => {
        const chat = chats[chatKey];
        if (chat.messages && chat.messages.length > 0) {
            const lastReadIndex = readMessages[chatKey] || -1;
            const newMessages = chat.messages.filter((msg, index) => 
                index > lastReadIndex && msg.sender !== currentUser.phone
            );
            unreadCount += newMessages.length;
        }
    });
    
    return unreadCount;
}

// Mark chat as read
function markChatAsRead(chatKey) {
    const chats = JSON.parse(localStorage.getItem('chats') || '{}');
    const chat = chats[chatKey];
    
    if (chat && chat.messages) {
        const readMessages = JSON.parse(localStorage.getItem('readMessages') || '{}');
        readMessages[chatKey] = chat.messages.length - 1;
        localStorage.setItem('readMessages', JSON.stringify(readMessages));
        
        updateMessageBadge(getUnreadMessagesCount());
    }
}

// Check for new messages periodically
function startMessageNotifications() {
    setInterval(() => {
        const unreadCount = getUnreadMessagesCount();
        updateMessageBadge(unreadCount);
    }, 5000); // Check every 5 seconds
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    if (currentUser.phone) {
        updateMessageBadge(getUnreadMessagesCount());
        startMessageNotifications();
    }
});
