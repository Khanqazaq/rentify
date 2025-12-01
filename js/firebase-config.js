// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyACuJHz3o4iW7bJOuAHLKbjrcZtFONpqh8",
    authDomain: "rentify-kz.firebaseapp.com",
    projectId: "rentify-kz",
    storageBucket: "rentify-kz.firebasestorage.app",
    messagingSenderId: "168071575894",
    appId: "1:168071575894:web:16f7b3cfc976352dcdfef7",
    measurementId: "G-YSRKP1FMM0"
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
