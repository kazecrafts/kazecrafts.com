// ===== FIREBASE USER FEATURES =====
// Wishlist, Profile Settings, and Order History

// User wishlist (stored in Firestore and synced to local)
let userWishlist = [];
let userOrders = [];
let userProfile = {};

// ===== SHOPPING CART PERSISTENCE =====

// Save cart to Firestore
async function saveCartToFirestore() {
    if (!currentUser || !db) {
        // Fallback to localStorage only if not logged in
        return;
    }
    
    try {
        // Save cart to Firestore
        await db.collection('users').doc(currentUser.uid).set({
            cart: cart.map(item => ({
                id: item.id,
                name: item.name,
                artisan: item.artisan,
                price: item.price,
                image: item.image,
                location: item.location,
                category: item.category,
                badge: item.badge,
                description: item.description,
                materials: item.materials,
                dimensions: item.dimensions
            })),
            cartUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        console.log('🛒 Cart saved to Firestore:', cart.length, 'items');
    } catch (error) {
        console.error('Error saving cart to Firestore:', error);
    }
}

// Clear cart from Firestore (after checkout)
async function clearCartFromFirestore() {
    if (!currentUser || !db) return;
    
    try {
        await db.collection('users').doc(currentUser.uid).update({
            cart: [],
            cartUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('🛒 Cart cleared from Firestore');
    } catch (error) {
        console.error('Error clearing cart from Firestore:', error);
    }
}

// Load cart from Firestore
async function loadCartFromFirestore() {
    if (!currentUser || !db) return;
    
    try {
        const doc = await db.collection('users').doc(currentUser.uid).get();
        
        if (doc.exists && doc.data().cart) {
            const firestoreCart = doc.data().cart;
            
            // Merge with local cart (in case items were added before login)
            const localCart = [...cart];
            
            // Clear cart and add Firestore items
            cart = [];
            firestoreCart.forEach(item => {
                const product = products.find(p => p.id === item.id);
                if (product) {
                    cart.push(product);
                }
            });
            
            // Add any local items that weren't in Firestore
            localCart.forEach(item => {
                if (!cart.some(c => c.id === item.id)) {
                    cart.push(item);
                }
            });
            
            console.log('🛒 Cart loaded from Firestore:', cart.length, 'items');
            
            // Update UI and save merged cart
            if (typeof updateCartUI === 'function') {
                updateCartUI();
            }
            
            // Save merged cart back to Firestore
            if (cart.length > 0) {
                saveCartToFirestore();
            }
        }
    } catch (error) {
        console.error('Error loading cart from Firestore:', error);
    }
}

// ===== WISHLIST FUNCTIONS =====

// Add item to wishlist
async function addToWishlist(productId) {
    if (!currentUser) {
        showNotification('Please log in to add items to your wishlist 💙', 'info');
        openAuthModal('login');
        return;
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) {
        console.error('Product not found:', productId);
        showNotification('Product not found', 'error');
        return;
    }
    
    // Check if already in wishlist
    if (userWishlist.some(item => item.id === productId)) {
        showNotification('✓ Already in your wishlist!', 'info');
        // Still open wishlist to show them
        openWishlistModal();
        return;
    }
    
    try {
        // Add to Firestore if available
        if (db && currentUser) {
            await db.collection('users').doc(currentUser.uid).collection('wishlist').doc(String(productId)).set({
                productId: productId,
                productName: product.name,
                productImage: product.image,
                productPrice: product.price,
                productArtisan: product.artisan,
                productLocation: product.location,
                addedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ Saved to Firestore');
        }
        
        // Add to local array
        userWishlist.push(product);
        
        showNotification(`❤️ ${product.name} added to wishlist!`, 'success');
        console.log('✅ Added to wishlist:', product.name);
        
        // Update wishlist count/badge
        updateWishlistBadge();
        
        // Auto-open wishlist modal to show the item
        setTimeout(() => {
            openWishlistModal();
        }, 800);
        
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        showNotification('Failed to add to wishlist. Please try again.', 'error');
    }
}

// Remove item from wishlist
async function removeFromWishlist(productId) {
    if (!currentUser) return;
    
    try {
        // Remove from Firestore
        if (db) {
            await db.collection('users').doc(currentUser.uid).collection('wishlist').doc(String(productId)).delete();
        }
        
        // Remove from local array
        userWishlist = userWishlist.filter(item => item.id !== productId);
        
        showNotification('💔 Removed from wishlist', 'success');
        
        // Refresh wishlist display immediately
        displayWishlist();
        updateWishlistBadge();
        
        console.log('✅ Removed from wishlist. Remaining:', userWishlist.length);
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        showNotification('Failed to remove from wishlist', 'error');
    }
}

// Load wishlist from Firestore
async function loadWishlist() {
    if (!currentUser || !db) return;
    
    try {
        const wishlistRef = db.collection('users').doc(currentUser.uid).collection('wishlist');
        const snapshot = await wishlistRef.get();
        
        userWishlist = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // Find full product data
            const product = products.find(p => p.id === data.productId);
            if (product) {
                userWishlist.push(product);
            }
        });
        
        console.log('✅ Wishlist loaded:', userWishlist.length, 'items');
        updateWishlistBadge();
    } catch (error) {
        console.error('Error loading wishlist:', error);
    }
}

// Display wishlist in modal
function displayWishlist() {
    const wishlistItems = document.getElementById('wishlistItems');
    
    if (userWishlist.length === 0) {
        wishlistItems.innerHTML = `
            <div class="empty-state">
                <i class="far fa-heart" style="font-size: 4rem; opacity: 0.2; margin-bottom: 1rem;"></i>
                <p>Your wishlist is empty</p>
                <p style="font-size: 0.9rem; opacity: 0.7;">Save your favorite items here!</p>
            </div>
        `;
        return;
    }
    
    wishlistItems.innerHTML = userWishlist.map(product => `
        <div class="wishlist-item">
            <img src="${product.image}" alt="${product.name}" onclick="openProductModal(${JSON.stringify(product).replace(/"/g, '&quot;')})">
            <div class="wishlist-item-info">
                <h4>${product.name}</h4>
                <p class="wishlist-item-artisan">${product.artisan}</p>
                <p class="wishlist-item-price">¥${product.price.toLocaleString()}</p>
                <div class="wishlist-item-actions">
                    <button onclick="addToCart(${product.id}); closeWishlistModal();" class="wishlist-add-cart">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    <button onclick="removeFromWishlist(${product.id})" class="wishlist-remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Update wishlist badge count
function updateWishlistBadge() {
    const wishlistIcon = document.querySelector('.nav-icon[onclick*="toggleWishlist"]');
    
    if (!wishlistIcon) {
        console.log('Wishlist items:', userWishlist.length);
        return;
    }
    
    // Check if badge already exists
    let badge = wishlistIcon.querySelector('.wishlist-count');
    
    if (!badge) {
        // Create badge
        badge = document.createElement('span');
        badge.className = 'wishlist-count';
        badge.style.cssText = `
            position: absolute;
            top: -5px;
            right: -8px;
            background: linear-gradient(135deg, #dc3545, #c82333);
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 0.7rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(220, 53, 69, 0.4);
            animation: pulse 0.3s ease;
        `;
        wishlistIcon.appendChild(badge);
    }
    
    // Update count
    badge.textContent = userWishlist.length;
    badge.style.display = userWishlist.length > 0 ? 'flex' : 'none';
    
    console.log('💙 Wishlist items:', userWishlist.length);
}

// ===== PROFILE SETTINGS FUNCTIONS =====

// Load user profile from Firestore
async function loadUserProfile() {
    if (!currentUser || !db) return;
    
    try {
        const doc = await db.collection('users').doc(currentUser.uid).get();
        
        if (doc.exists) {
            userProfile = doc.data();
            console.log('✅ User profile loaded');
        } else {
            // Create default profile
            userProfile = {
                displayName: currentUser.displayName || '',
                email: currentUser.email,
                phone: '',
                preferences: {
                    mailingList: false,
                    promotions: false,
                    orderUpdates: true
                }
            };
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Display profile in settings modal
function displayProfile() {
    document.getElementById('profileName').value = userProfile.displayName || currentUser.displayName || '';
    document.getElementById('profileEmail').value = currentUser.email;
    document.getElementById('profilePhone').value = userProfile.phone || '';
    document.getElementById('profileMailingList').checked = userProfile.preferences?.mailingList || false;
    document.getElementById('profilePromotions').checked = userProfile.preferences?.promotions || false;
    document.getElementById('profileOrderUpdates').checked = userProfile.preferences?.orderUpdates !== false;
}

// Save profile settings
async function saveProfileSettings(event) {
    event.preventDefault();
    
    if (!currentUser || !db) {
        showNotification('Please log in to save settings', 'error');
        return;
    }
    
    const displayName = document.getElementById('profileName').value;
    const phone = document.getElementById('profilePhone').value;
    const mailingList = document.getElementById('profileMailingList').checked;
    const promotions = document.getElementById('profilePromotions').checked;
    const orderUpdates = document.getElementById('profileOrderUpdates').checked;
    
    try {
        // Update Firestore
        await db.collection('users').doc(currentUser.uid).update({
            displayName: displayName,
            phone: phone,
            preferences: {
                mailingList: mailingList,
                promotions: promotions,
                orderUpdates: orderUpdates
            },
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update Firebase Auth display name
        if (displayName !== currentUser.displayName) {
            await currentUser.updateProfile({
                displayName: displayName
            });
            
            // Update UI
            const userDisplayNameEl = document.getElementById('userDisplayName');
            if (userDisplayNameEl) {
                userDisplayNameEl.textContent = displayName;
            }
        }
        
        // Update local profile
        userProfile.displayName = displayName;
        userProfile.phone = phone;
        userProfile.preferences = {
            mailingList: mailingList,
            promotions: promotions,
            orderUpdates: orderUpdates
        };
        
        showNotification('✅ Profile settings saved successfully!', 'success');
        console.log('✅ Profile updated');
        
        closeProfileModal();
    } catch (error) {
        console.error('Error saving profile:', error);
        showNotification('Failed to save profile settings', 'error');
    }
}

// ===== ORDER HISTORY FUNCTIONS =====

// Save order to Firestore (call this after successful checkout)
async function saveOrder(orderData) {
    if (!currentUser || !db) return;
    
    try {
        const orderRef = await db.collection('users').doc(currentUser.uid).collection('orders').add({
            items: orderData.items,
            total: orderData.total,
            shipping: orderData.shipping || {},
            status: 'processing',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Order saved:', orderRef.id);
        return orderRef.id;
    } catch (error) {
        console.error('Error saving order:', error);
    }
}

// Load order history from Firestore
async function loadOrderHistory() {
    if (!currentUser || !db) return;
    
    try {
        const ordersRef = db.collection('users').doc(currentUser.uid).collection('orders').orderBy('createdAt', 'desc');
        const snapshot = await ordersRef.get();
        
        userOrders = [];
        snapshot.forEach(doc => {
            userOrders.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log('✅ Order history loaded:', userOrders.length, 'orders');
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Display order history
function displayOrders() {
    const ordersList = document.getElementById('ordersList');
    
    if (userOrders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-bag" style="font-size: 4rem; opacity: 0.2; margin-bottom: 1rem;"></i>
                <p>No orders yet</p>
                <p style="font-size: 0.9rem; opacity: 0.7;">Your order history will appear here</p>
            </div>
        `;
        return;
    }
    
    ordersList.innerHTML = userOrders.map(order => {
        const date = order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A';
        const statusColor = {
            'processing': '#ff9f1c',
            'shipped': '#4285f4',
            'delivered': '#28a745',
            'cancelled': '#dc3545'
        }[order.status] || '#666';
        
        return `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <h4>Order #${order.id.substring(0, 8).toUpperCase()}</h4>
                        <p class="order-date">${date}</p>
                    </div>
                    <div class="order-status" style="color: ${statusColor};">
                        <i class="fas fa-circle" style="font-size: 0.5rem;"></i>
                        ${order.status.toUpperCase()}
                    </div>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <img src="${item.image}" alt="${item.name}">
                            <div>
                                <p>${item.name}</p>
                                <small>${item.artisan}</small>
                            </div>
                            <p class="order-item-price">¥${item.price.toLocaleString()}</p>
                        </div>
                    `).join('')}
                </div>
                <div class="order-total">
                    <strong>Total:</strong> ¥${order.total.toLocaleString()}
                </div>
            </div>
        `;
    }).join('');
}

// ===== MODAL FUNCTIONS =====

// Open Wishlist Modal
function openWishlistModal() {
    if (!currentUser) {
        showNotification('Please log in to view your wishlist 💙', 'info');
        openAuthModal('login');
        return;
    }
    
    const modal = document.getElementById('wishlistModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Load fresh data from Firestore and display
    loadWishlist().then(() => {
        displayWishlist();
    });
}

function closeWishlistModal() {
    const modal = document.getElementById('wishlistModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Open Profile Modal
function openProfileModal() {
    if (!currentUser) {
        showNotification('Please log in to access profile settings', 'info');
        openAuthModal('login');
        return;
    }
    
    const modal = document.getElementById('profileModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    displayProfile();
}

function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Open Orders Modal
function openOrdersModal() {
    if (!currentUser) {
        showNotification('Please log in to view your orders', 'info');
        openAuthModal('login');
        return;
    }
    
    const modal = document.getElementById('ordersModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    loadOrderHistory().then(() => {
        displayOrders();
    });
}

function closeOrdersModal() {
    const modal = document.getElementById('ordersModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ===== UPDATE NAV DROPDOWN ACTIONS =====

// Replace placeholder functions with real ones
function viewMyOrders(event) {
    event.preventDefault();
    closeUserMenu();
    openOrdersModal();
}

function viewProfile(event) {
    event.preventDefault();
    closeUserMenu();
    openProfileModal();
}

function viewWishlist(event) {
    event.preventDefault();
    closeUserMenu();
    openWishlistModal();
}

// ===== INITIALIZE USER DATA ON LOGIN =====

// Listen for auth state and load user data
if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            // Load all user data
            await loadUserProfile();
            await loadCartFromFirestore();
            await loadWishlist();
            await loadOrderHistory();
            
            console.log('✅ User data loaded for:', user.email);
        } else {
            // Clear user data on logout (but keep cart in localStorage)
            userWishlist = [];
            userOrders = [];
            userProfile = {};
        }
    });
}

// Override existing cart functions to add Firestore sync
if (typeof saveCart === 'function') {
    const originalSaveCart = saveCart;
    saveCart = function() {
        originalSaveCart();
        saveCartToFirestore();
    };
}

// Override the existing toggleWishlist function
window.toggleWishlist = function() {
    openWishlistModal();
};

console.log('✨ User features module loaded');

