// ========== DATABASE OPERATIONS ==========

// === ITEMS (Вещи) ===

// Добавить новую вещь
async function addItem(itemData) {
    try {
        const docRef = await db.collection('items').add({
            ...itemData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Item added with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error adding item:', error);
        throw error;
    }
}

// Получить все вещи
async function getAllItems() {
    try {
        const snapshot = await db.collection('items')
            .orderBy('createdAt', 'desc')
            .get();
        
        const items = [];
        snapshot.forEach(doc => {
            items.push({
                id: doc.id,
                ...doc.data()
            });
        });
        return items;
    } catch (error) {
        console.error('Error getting items:', error);
        return [];
    }
}

// Получить вещи по категории
async function getItemsByCategory(category, subcategory = null) {
    try {
        let query = db.collection('items').where('category', '==', category);
        
        if (subcategory) {
            query = query.where('subcategory', '==', subcategory);
        }
        
        const snapshot = await query.orderBy('createdAt', 'desc').get();
        
        const items = [];
        snapshot.forEach(doc => {
            items.push({
                id: doc.id,
                ...doc.data()
            });
        });
        return items;
    } catch (error) {
        console.error('Error getting items by category:', error);
        return [];
    }
}

// Получить одну вещь по ID
async function getItemById(itemId) {
    try {
        const doc = await db.collection('items').doc(itemId).get();
        if (doc.exists) {
            return {
                id: doc.id,
                ...doc.data()
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting item:', error);
        return null;
    }
}

// === USERS (Пользователи) ===

// Создать профиль пользователя
async function createUserProfile(uid, userData) {
    try {
        await db.collection('users').doc(uid).set({
            ...userData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('User profile created');
    } catch (error) {
        console.error('Error creating user profile:', error);
        throw error;
    }
}

// Получить профиль пользователя
async function getUserProfile(uid) {
    try {
        const doc = await db.collection('users').doc(uid).get();
        if (doc.exists) {
            return doc.data();
        }
        return null;
    } catch (error) {
        console.error('Error getting user profile:', error);
        return null;
    }
}

// === CHATS (Чаты) ===

// Создать или получить чат
async function getOrCreateChat(itemId, renterId, ownerId) {
    try {
        const chatId = `${itemId}_${renterId}`;
        const chatRef = db.collection('chats').doc(chatId);
        const chatDoc = await chatRef.get();
        
        if (!chatDoc.exists) {
            await chatRef.set({
                itemId,
                renterId,
                ownerId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        return chatId;
    } catch (error) {
        console.error('Error getting/creating chat:', error);
        throw error;
    }
}

// Отправить сообщение
async function sendMessage(chatId, senderId, senderName, message) {
    try {
        await db.collection('chats').doc(chatId).collection('messages').add({
            senderId,
            senderName,
            message,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Message sent');
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

// Подписаться на сообщения чата (real-time)
function subscribeToMessages(chatId, callback) {
    return db.collection('chats').doc(chatId).collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot(snapshot => {
            const messages = [];
            snapshot.forEach(doc => {
                messages.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            callback(messages);
        });
}

// === STORAGE (Загрузка файлов) ===

// Загрузить изображение
async function uploadImage(file, path) {
    try {
        const storageRef = storage.ref();
        const imageRef = storageRef.child(`${path}/${Date.now()}_${file.name}`);
        
        const snapshot = await imageRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        console.log('Image uploaded:', downloadURL);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

// Загрузить несколько изображений
async function uploadMultipleImages(files, path) {
    try {
        const uploadPromises = Array.from(files).map(file => uploadImage(file, path));
        const urls = await Promise.all(uploadPromises);
        return urls;
    } catch (error) {
        console.error('Error uploading multiple images:', error);
        throw error;
    }
}
