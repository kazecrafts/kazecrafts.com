// ===== FIREBASE AUTHENTICATION LOGIC =====

let currentUser = null;

// Initialize auth state listener
if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().onAuthStateChanged((user) => {
        currentUser = user;
        updateUIForAuthState(user);
        
        if (user) {
            console.log('👤 User signed in:', user.email);
            // Store user data in localStorage for persistence
            localStorage.setItem('kazeUserData', JSON.stringify({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL
            }));
        } else {
            console.log('👤 User signed out');
            localStorage.removeItem('kazeUserData');
        }
    });
}

// Update UI based on authentication state
function updateUIForAuthState(user) {
    const loginBtn = document.getElementById('navLoginBtn');
    const userDropdown = document.getElementById('navUserDropdown');
    const userDisplayName = document.getElementById('userDisplayName');
    const userEmail = document.getElementById('userEmail');
    
    if (user) {
        // User is signed in
        if (loginBtn) loginBtn.style.display = 'none';
        if (userDropdown) userDropdown.style.display = 'block';
        
        // Update user info
        if (userDisplayName) {
            userDisplayName.textContent = user.displayName || user.email.split('@')[0];
        }
        if (userEmail) {
            userEmail.textContent = user.email;
        }
    } else {
        // User is signed out
        if (loginBtn) loginBtn.style.display = 'flex';
        if (userDropdown) userDropdown.style.display = 'none';
    }
}

// ===== MODAL FUNCTIONS =====
function openAuthModal(mode = 'login') {
    const modal = document.getElementById('authModal');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const resetForm = document.getElementById('resetPasswordForm');
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Show appropriate form
    if (mode === 'login') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        resetForm.style.display = 'none';
    } else if (mode === 'signup') {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        resetForm.style.display = 'none';
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Clear form errors
    clearAuthErrors();
}

function switchToLogin(event) {
    event.preventDefault();
    openAuthModal('login');
}

function switchToSignup(event) {
    event.preventDefault();
    openAuthModal('signup');
}

function openPasswordReset(event) {
    event.preventDefault();
    const loginForm = document.getElementById('loginForm');
    const resetForm = document.getElementById('resetPasswordForm');
    
    loginForm.style.display = 'none';
    resetForm.style.display = 'block';
}

function clearAuthErrors() {
    const errors = document.querySelectorAll('.auth-error');
    errors.forEach(error => {
        error.textContent = '';
        error.style.display = 'none';
    });
}

// ===== AUTHENTICATION FUNCTIONS =====

// Email/Password Login
async function handleEmailLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const loginBtn = document.getElementById('loginBtn');
    const errorDiv = document.getElementById('loginError');
    
    // Check if Firebase is configured
    if (!auth) {
        showAuthError(errorDiv, 'Firebase is not configured. Please set up your Firebase credentials.');
        return;
    }
    
    // Disable button and show loading
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    clearAuthErrors();
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('✅ Login successful:', userCredential.user.email);
        
        showNotification('Welcome back! 👋', 'success');
        closeAuthModal();
        
        // Reset form
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
    } catch (error) {
        console.error('Login error:', error);
        showAuthError(errorDiv, getAuthErrorMessage(error.code));
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Log In';
    }
}

// Email/Password Signup
async function handleEmailSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
    const signupBtn = document.getElementById('signupBtn');
    const errorDiv = document.getElementById('signupError');
    
    // Check if Firebase is configured
    if (!auth) {
        showAuthError(errorDiv, 'Firebase is not configured. Please set up your Firebase credentials.');
        return;
    }
    
    // Validate passwords match
    if (password !== passwordConfirm) {
        showAuthError(errorDiv, 'Passwords do not match');
        return;
    }
    
    // Disable button and show loading
    signupBtn.disabled = true;
    signupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    clearAuthErrors();
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        console.log('✅ Signup successful:', userCredential.user.email);
        
        // Update user profile with display name
        await userCredential.user.updateProfile({
            displayName: name
        });
        
        showNotification('Account created successfully! Welcome to Kaze Crafts! 🎉', 'success');
        closeAuthModal();
        
        // Reset form
        document.getElementById('signupName').value = '';
        document.getElementById('signupEmail').value = '';
        document.getElementById('signupPassword').value = '';
        document.getElementById('signupPasswordConfirm').value = '';
    } catch (error) {
        console.error('Signup error:', error);
        showAuthError(errorDiv, getAuthErrorMessage(error.code));
    } finally {
        signupBtn.disabled = false;
        signupBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
    }
}

// Google Sign In
async function signInWithGoogle() {
    // Check if Firebase is configured
    if (!auth) {
        showNotification('Firebase is not configured. Please set up your Firebase credentials.', 'error');
        return;
    }
    
    const provider = new firebase.auth.GoogleAuthProvider();
    
    try {
        const result = await auth.signInWithPopup(provider);
        console.log('✅ Google sign in successful:', result.user.email);
        
        showNotification('Welcome! 👋', 'success');
        closeAuthModal();
    } catch (error) {
        console.error('Google sign in error:', error);
        
        // Handle popup closed by user
        if (error.code === 'auth/popup-closed-by-user') {
            // Don't show error, user intentionally closed popup
            return;
        }
        
        showNotification(getAuthErrorMessage(error.code), 'error');
    }
}

// Password Reset
async function handlePasswordReset(event) {
    event.preventDefault();
    
    const email = document.getElementById('resetEmail').value;
    const resetBtn = document.getElementById('resetBtn');
    const errorDiv = document.getElementById('resetError');
    const successDiv = document.getElementById('resetSuccess');
    
    // Check if Firebase is configured
    if (!auth) {
        showAuthError(errorDiv, 'Firebase is not configured. Please set up your Firebase credentials.');
        return;
    }
    
    // Disable button and show loading
    resetBtn.disabled = true;
    resetBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    clearAuthErrors();
    successDiv.style.display = 'none';
    
    try {
        await auth.sendPasswordResetEmail(email);
        console.log('✅ Password reset email sent to:', email);
        
        successDiv.textContent = '✓ Password reset email sent! Check your inbox.';
        successDiv.style.display = 'block';
        
        // Clear email field
        document.getElementById('resetEmail').value = '';
        
        // Auto switch back to login after 3 seconds
        setTimeout(() => {
            switchToLogin(new Event('click'));
        }, 3000);
    } catch (error) {
        console.error('Password reset error:', error);
        showAuthError(errorDiv, getAuthErrorMessage(error.code));
    } finally {
        resetBtn.disabled = false;
        resetBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Reset Link';
    }
}

// Logout
async function handleLogout(event) {
    event.preventDefault();
    
    if (!auth) {
        showNotification('Firebase is not configured', 'error');
        return;
    }
    
    try {
        await auth.signOut();
        console.log('✅ User signed out');
        showNotification('Logged out successfully. See you soon! 👋', 'success');
        
        // Close user menu
        closeUserMenu();
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Error signing out. Please try again.', 'error');
    }
}

// ===== USER MENU FUNCTIONS =====
function toggleUserMenu() {
    const menu = document.getElementById('userDropdownMenu');
    menu.classList.toggle('active');
}

function closeUserMenu() {
    const menu = document.getElementById('userDropdownMenu');
    menu.classList.remove('active');
}

// Close user menu when clicking outside
document.addEventListener('click', function(event) {
    const userSection = document.getElementById('navUserSection');
    const menu = document.getElementById('userDropdownMenu');
    
    if (menu && userSection && !userSection.contains(event.target)) {
        menu.classList.remove('active');
    }
});

// ===== USER ACTIONS =====
function viewMyOrders(event) {
    event.preventDefault();
    closeUserMenu();
    showNotification('Order history feature coming soon!', 'info');
}

function viewProfile(event) {
    event.preventDefault();
    closeUserMenu();
    showNotification('Profile settings feature coming soon!', 'info');
}

function viewWishlist(event) {
    event.preventDefault();
    closeUserMenu();
    showNotification('Wishlist feature coming soon!', 'info');
}

// ===== ERROR HANDLING =====
function showAuthError(errorDiv, message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function getAuthErrorMessage(errorCode) {
    const errorMessages = {
        'auth/email-already-in-use': 'This email is already registered. Please log in instead.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
        'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
        'auth/user-disabled': 'This account has been disabled. Please contact support.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Please check your connection.',
        'auth/popup-blocked': 'Popup was blocked by your browser. Please allow popups for this site.',
        'auth/popup-closed-by-user': 'Sign in was cancelled.',
        'auth/cancelled-popup-request': 'Only one popup request is allowed at a time.',
        'auth/invalid-credential': 'Invalid credentials. Please try again.'
    };
    
    return errorMessages[errorCode] || 'An error occurred. Please try again.';
}

// ===== CLOSE MODAL ON ESCAPE =====
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const authModal = document.getElementById('authModal');
        if (authModal && authModal.classList.contains('active')) {
            closeAuthModal();
        }
    }
});

// ===== INITIALIZATION =====
console.log('🔐 Firebase Auth module loaded');


