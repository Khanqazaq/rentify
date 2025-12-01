// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBqVV4YdVmxJ_PYuXKqWx3h8TtGxYrK6Nk",
    authDomain: "rentify-kz.firebaseapp.com",
    projectId: "rentify-kz",
    storageBucket: "rentify-kz.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Настройка Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Слушатель изменения состояния аутентификации
auth.onAuthStateChanged(function(user) {
    if (user) {
        console.log('Пользователь авторизован:', user.displayName || user.email);
        
        // Обновить UI для авторизованного пользователя
        updateUserUI(user);
    } else {
        console.log('Пользователь не авторизован');
        
        // Обновить UI для неавторизованного пользователя
        updateUserUI(null);
    }
});

// Функция обновления UI
function updateUserUI(user) {
    const loginBtn = document.querySelector('[href="login.html"]');
    
    if (user && loginBtn) {
        // Заменить кнопку "Вход" на профиль пользователя
        loginBtn.innerHTML = `
            <img src="${user.photoURL || 'https://via.placeholder.com/32'}" 
                 alt="Profile" 
                 style="width: 32px; height: 32px; border-radius: 50%; margin-right: 8px;">
            ${user.displayName || user.email}
        `;
        loginBtn.href = 'profile.html';
    }
}

console.log('Firebase initialized successfully!');
