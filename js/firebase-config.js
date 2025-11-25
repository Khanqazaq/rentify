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

console.log('Firebase initialized successfully!');
