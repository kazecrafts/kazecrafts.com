# 🔥 Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for the Kaze Crafts marketplace.

## 📋 Table of Contents
1. [Create Firebase Project](#create-firebase-project)
2. [Enable Authentication Methods](#enable-authentication-methods)
3. [Get Configuration](#get-configuration)
4. [Configure Your Site](#configure-your-site)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Create Firebase Project

### Step 1: Go to Firebase Console
Visit [Firebase Console](https://console.firebase.google.com/)

### Step 2: Create a New Project
1. Click **"Add project"** or **"Create a project"**
2. Enter project name: **"Kaze Crafts"** (or your preferred name)
3. (Optional) Enable Google Analytics
4. Click **"Create project"**
5. Wait for project creation to complete

### Step 3: Register Your Web App
1. In your Firebase project dashboard, click the **Web icon** (`</>`) to add a web app
2. Enter app nickname: **"Kaze Crafts Web"**
3. ✅ Check **"Also set up Firebase Hosting"** (optional, but recommended)
4. Click **"Register app"**
5. You'll see your Firebase configuration - **keep this page open!**

---

## 🔐 Enable Authentication Methods

### Step 1: Navigate to Authentication
1. In Firebase Console sidebar, click **"Authentication"**
2. Click **"Get started"** if this is your first time

### Step 2: Enable Email/Password Authentication
1. Go to **"Sign-in method"** tab
2. Click on **"Email/Password"**
3. Toggle **"Enable"** to ON
4. Click **"Save"**

### Step 3: Enable Google Sign-In
1. In the same **"Sign-in method"** tab
2. Click on **"Google"**
3. Toggle **"Enable"** to ON
4. Select a **"Support email"** from dropdown
5. Click **"Save"**

### Step 4: (Optional) Add Authorized Domains
1. Go to **"Settings"** tab in Authentication
2. Scroll to **"Authorized domains"**
3. Add your domain (e.g., `kazecrafts.com`)
4. `localhost` is already authorized for development

---

## ⚙️ Get Configuration

### Step 1: Find Your Config
1. Go to **Project Settings** (gear icon in sidebar)
2. Scroll down to **"Your apps"** section
3. Find your web app and look for **"SDK setup and configuration"**
4. Select **"Config"** option (not npm)
5. Copy the `firebaseConfig` object

It will look something like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC8xxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "kaze-crafts-xxxxx.firebaseapp.com",
  projectId: "kaze-crafts",
  storageBucket: "kaze-crafts-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxx"
};
```

---

## 🛠️ Configure Your Site

### Step 1: Update `firebase-config.js`
Open the `firebase-config.js` file in your project root and replace the placeholder values:

**Before:**
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

**After (with your actual values):**
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyC8xxxxxxxxxxxxxxxxxxxxxxxxxxx",
    authDomain: "kaze-crafts-xxxxx.firebaseapp.com",
    projectId: "kaze-crafts-xxxxx",
    storageBucket: "kaze-crafts-xxxxx.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:xxxxxxxxxxxx"
};
```

### Step 2: Save the File
Save `firebase-config.js` - that's it! Your authentication is now configured.

---

## ✅ Testing

### 1. Open Your Site
Open `index.html` in your browser or run your local server.

### 2. Check Console
Open browser DevTools (F12) and look for:
```
✅ Firebase initialized successfully!
🔥 Firebase Auth ready
🔥 Firebase Authentication: ACTIVE
```

### 3. Test Sign-Up
1. Click **"Login"** button in the navbar
2. Click **"Sign up"** link
3. Fill in:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `test123` (minimum 6 characters)
4. Click **"Create Account"**
5. You should see: `"Account created successfully! Welcome to Kaze Crafts! 🎉"`

### 4. Test Login
1. Click **"Login"** button
2. Enter your test credentials
3. You should be logged in and see your user avatar in the navbar

### 5. Test Google Sign-In
1. Click **"Login"** button
2. Click **"Continue with Google"**
3. Select your Google account
4. You should be logged in

### 6. View User in Firebase
1. Go to Firebase Console → Authentication → Users
2. You should see your test user(s) listed

---

## 🐛 Troubleshooting

### Issue: "Firebase is not configured"
**Solution:** Make sure you've updated `firebase-config.js` with your actual Firebase credentials.

### Issue: Google Sign-In popup blocked
**Solution:** Allow popups in your browser for localhost or your domain.

### Issue: "Email already in use"
**Solution:** This email is already registered. Try logging in instead of signing up.

### Issue: "Invalid email"
**Solution:** Make sure you're using a properly formatted email address.

### Issue: "Weak password"
**Solution:** Use at least 6 characters for the password.

### Issue: "Too many requests"
**Solution:** Firebase has rate limiting. Wait a few minutes and try again.

### Issue: Console shows 403 or API key error
**Solution:** 
1. Check that your API key is correct in `firebase-config.js`
2. Make sure you've enabled Authentication in Firebase Console
3. Verify your domain is in the Authorized Domains list

---

## 🎨 Features Implemented

### ✅ Authentication Methods
- Email/Password registration
- Email/Password login
- Google Sign-In (OAuth)
- Password reset via email

### ✅ User Interface
- Beautiful login/signup modal
- User profile dropdown in navbar
- Responsive design (mobile-friendly)
- Smooth animations
- Error handling with user-friendly messages

### ✅ User Management
- Persistent authentication state
- Display name support
- User profile information
- Logout functionality

### 🚧 Coming Soon
- My Orders (order history)
- Profile Settings
- Wishlist integration
- User address book
- Facebook Sign-In
- Twitter Sign-In

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Google Sign-In Setup](https://firebase.google.com/docs/auth/web/google-signin)
- [Firebase Console](https://console.firebase.google.com/)

---

## 🔒 Security Best Practices

### ✅ Done for You
- API keys are public-facing (this is normal and safe for Firebase)
- Authentication state is managed securely by Firebase
- Passwords are hashed and never exposed
- OAuth tokens are handled by Firebase

### ⚠️ Important Notes
1. **Never commit** your Firebase Admin SDK private key
2. Set up **Firebase Security Rules** for Firestore/Storage if you add those later
3. Enable **App Check** in production to prevent abuse
4. Monitor usage in Firebase Console to detect anomalies
5. Set up **Email verification** if you want to verify user emails

---

## 🎉 You're All Set!

Your Firebase Authentication is now fully configured and ready to use! Users can:
- ✅ Sign up with email/password
- ✅ Sign in with email/password
- ✅ Sign in with Google
- ✅ Reset their password
- ✅ View their profile
- ✅ Log out securely

Enjoy your authenticated Kaze Crafts marketplace! 🚀

---

## 💬 Need Help?

If you run into any issues:
1. Check the browser console for error messages
2. Review the Troubleshooting section above
3. Check Firebase Console for service status
4. Verify your configuration in `firebase-config.js`
5. Make sure all authentication methods are enabled in Firebase Console

---

**Last Updated:** October 2025  
**Version:** 1.0.0


