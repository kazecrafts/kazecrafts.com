// ===== FIREBASE CONFIGURATION =====
// Replace these values with your own Firebase project configuration
// Get these from: Firebase Console > Project Settings > Your apps > Web app

const firebaseConfig = {
    apiKey: "AIzaSyCwZGQZ4A_nuA7EHeEFNTOx--daeHN2tOo",
    authDomain: "kaze-crafts.firebaseapp.com",
    projectId: "kaze-crafts",
    storageBucket: "kaze-crafts.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // ← Replace this from Firebase Console
    appId: "YOUR_APP_ID" // ← Replace this from Firebase Console
};

// Initialize Firebase
let firebaseApp = null;
let auth = null;
let db = null;

try {
    // Check if Firebase is loaded
    if (typeof firebase !== 'undefined') {
        firebaseApp = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        console.log('✅ Firebase initialized successfully!');
        console.log('🔥 Firebase Auth ready');
        console.log('💾 Firebase Firestore ready');
    } else {
        console.error('❌ Firebase SDK not loaded');
    }
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

// Check if configuration needs to be updated
function checkFirebaseConfig() {
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY_HERE") {
        console.warn('⚠️ Firebase configuration not set up yet!');
        console.log('📖 Please update firebase-config.js with your Firebase project credentials');
        console.log('📚 See FIREBASE_SETUP.md for detailed instructions');
        return false;
    }
    return true;
}

// Log configuration status
window.addEventListener('load', function() {
    if (auth) {
        const isConfigured = checkFirebaseConfig();
        if (isConfigured) {
            console.log('%c🔥 Firebase Authentication: ACTIVE', 'color: #ff6b35; font-weight: bold; font-size: 14px;');
            console.log('💡 Users can now sign up and log in');
        } else {
            console.log('%c⚠️ Firebase Authentication: NEEDS CONFIGURATION', 'color: #ff9f1c; font-weight: bold; font-size: 14px;');
            console.log('📖 Update firebase-config.js with your Firebase credentials');
        }
    }
});

