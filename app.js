// Initialize Stripe with your publishable key
// Replace with your actual Stripe publishable key
const stripe = Stripe('pk_test_51234567890'); // TODO: Replace with real key
let elements;
let cardElement;

// Craft locations data with detailed information
const craftLocations = [
    {
        name: "Kyoto",
        nameJp: "京都",
        lat: 35.0116,
        lng: 135.7681,
        type: "pottery",
        icon: "🏺",
        specialty: "Kyo-yaki Pottery",
        products: 45,
        description: "Ancient capital known for exquisite ceramics and tea ceremony pottery"
    },
    {
        name: "Tokyo",
        nameJp: "東京",
        lat: 35.6762,
        lng: 139.6503,
        type: "kimono",
        icon: "👘",
        specialty: "Edo Kimono",
        products: 78,
        description: "Traditional Edo-style silk kimono and contemporary yukata"
    },
    {
        name: "Gifu",
        nameJp: "岐阜",
        lat: 35.3912,
        lng: 136.7223,
        type: "knife",
        icon: "🔪",
        specialty: "Seki Cutlery",
        products: 92,
        description: "World-renowned for Damascus steel and traditional bladesmithing"
    },
    {
        name: "Okayama",
        nameJp: "岡山",
        lat: 34.6555,
        lng: 133.9195,
        type: "pottery",
        icon: "🏺",
        specialty: "Bizen Pottery",
        products: 63,
        description: "Unglazed pottery with natural ash glaze from centuries-old kilns"
    },
    {
        name: "Kanazawa",
        nameJp: "金沢",
        lat: 36.5944,
        lng: 136.6256,
        type: "textile",
        icon: "🧵",
        specialty: "Kaga Yuzen Silk",
        products: 54,
        description: "Hand-painted silk textiles with gold and silver leaf embellishments"
    },
    {
        name: "Saga",
        nameJp: "佐賀",
        lat: 33.2492,
        lng: 130.2988,
        type: "pottery",
        icon: "🏺",
        specialty: "Arita & Imari Porcelain",
        products: 108,
        description: "Japan's first porcelain, exported worldwide for 400 years"
    },
    {
        name: "Nara",
        nameJp: "奈良",
        lat: 34.6851,
        lng: 135.8050,
        type: "textile",
        icon: "🧵",
        specialty: "Nara Sarashi Linen",
        products: 41,
        description: "Premium linen textiles and indigo-dyed fabrics"
    },
    {
        name: "Yamagata",
        nameJp: "山形",
        lat: 38.2404,
        lng: 140.3636,
        type: "kimono",
        icon: "👘",
        specialty: "Yonezawa Silk Weaving",
        products: 37,
        description: "Luxurious silk obi and traditional tsumugi kimono"
    },
    {
        name: "Ehime",
        nameJp: "愛媛",
        lat: 33.8416,
        lng: 132.7657,
        type: "textile",
        icon: "🧵",
        specialty: "Iyo Kasuri Fabric",
        products: 29,
        description: "Intricate ikat-dyed cotton and indigo kasuri patterns"
    },
    {
        name: "Osaka",
        nameJp: "大阪",
        lat: 34.6937,
        lng: 135.5023,
        type: "knife",
        icon: "🔪",
        specialty: "Sakai Blades",
        products: 67,
        description: "Premium kitchen knives used by master chefs worldwide"
    }
];

// Products data with detailed information
const products = [
    {
        id: 1,
        name: "Midnight Moon Bowl",
        artisan: "Tanaka Hiroshi",
        location: "Kyoto",
        price: 85000,
        image: "https://images.unsplash.com/photo-1606933245200-0b9a475e2e8e?w=600",
        badge: "New",
        category: "pottery",
        description: "Exquisite Raku-fired tea bowl with deep black glaze and subtle crackle patterns. Each piece is unique and fired in traditional anagama kilns.",
        materials: "Stoneware clay, natural ash glaze",
        dimensions: "12cm diameter × 8cm height"
    },
    {
        id: 2,
        name: "Golden Crane Kimono",
        artisan: "Sato Michiko",
        location: "Tokyo",
        price: 250000,
        image: "https://images.unsplash.com/photo-1545253088-a682b11ad5e1?w=600",
        badge: "Exclusive",
        category: "kimono",
        description: "Hand-painted silk kimono featuring golden cranes in flight. Created using traditional yuzen dyeing techniques passed down for 5 generations.",
        materials: "100% Silk, natural dyes, gold thread",
        dimensions: "160cm length, fits sizes S-L"
    },
    {
        id: 3,
        name: "Damascus Chef Knife",
        artisan: "Fujiwara Takeshi",
        location: "Gifu",
        price: 120000,
        image: "https://images.unsplash.com/photo-1593788398928-65ad5d9fa024?w=600",
        badge: "Featured",
        category: "knife",
        description: "67-layer Damascus steel gyuto knife with octagonal ebony handle. Hand-forged by 4th generation master bladesmith.",
        materials: "VG-10 core, Damascus steel, African Blackwood handle",
        dimensions: "24cm blade length"
    },
    {
        id: 4,
        name: "Bizen Tea Set",
        artisan: "Mori Kazuo",
        location: "Okayama",
        price: 95000,
        image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600",
        badge: "Limited",
        category: "pottery",
        description: "Complete 5-piece tea ceremony set with natural hi-iro (scarlet) markings. Wood-fired for 7 days in traditional climbing kiln.",
        materials: "Bizen clay, wood ash finish",
        dimensions: "Teapot: 15cm, 4 cups included"
    },
    {
        id: 5,
        name: "Kaga Silk Scarf",
        artisan: "Watanabe Haruko",
        location: "Kanazawa",
        price: 38000,
        image: "https://images.unsplash.com/photo-1528217580778-96e570819666?w=600",
        badge: "Popular",
        category: "textile",
        description: "Hand-painted yuzen silk scarf with cherry blossom motifs. Enhanced with real gold leaf accents.",
        materials: "100% Mulberry silk, natural dyes, 24k gold leaf",
        dimensions: "180cm × 40cm"
    },
    {
        id: 6,
        name: "Arita Blue Vase",
        artisan: "Kato Noboru",
        location: "Saga",
        price: 55000,
        image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600",
        badge: "Classic",
        category: "pottery",
        description: "Traditional sometsuke blue and white porcelain vase with intricate floral patterns. Created using 400-year-old Arita techniques.",
        materials: "Fine porcelain, cobalt oxide underglaze",
        dimensions: "28cm height × 12cm diameter"
    },
    {
        id: 7,
        name: "Nara Indigo Cloth",
        artisan: "Inoue Sachiko",
        location: "Nara",
        price: 42000,
        image: "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=600",
        badge: "Artisan",
        category: "textile",
        description: "Hand-woven indigo linen fabric dyed using traditional katazome stencil technique. Perfect for interior decoration or fashion.",
        materials: "Pure linen, natural indigo dye",
        dimensions: "2m × 1m bolt"
    },
    {
        id: 8,
        name: "Yonezawa Silk Obi",
        artisan: "Takeda Masako",
        location: "Yamagata",
        price: 88000,
        image: "https://images.unsplash.com/photo-1556388275-bb5585725aca?w=600",
        badge: "Heritage",
        category: "kimono",
        description: "Premium woven silk obi belt with geometric kasuri patterns. Handwoven on traditional looms.",
        materials: "100% Silk, natural dyes",
        dimensions: "360cm × 30cm"
    },
    {
        id: 9,
        name: "Sakura Teapot",
        artisan: "Tanaka Hiroshi",
        location: "Kyoto",
        price: 72000,
        image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=600",
        badge: "New",
        category: "pottery",
        description: "Delicate cherry blossom motif kyusu teapot with internal filter. Perfect for Japanese green tea.",
        materials: "Tokoname red clay, natural glaze",
        dimensions: "12cm height, 400ml capacity"
    },
    {
        id: 10,
        name: "Santoku Kitchen Knife",
        artisan: "Fujiwara Takeshi",
        location: "Gifu",
        price: 45000,
        image: "https://images.unsplash.com/photo-1601924582970-9238bcb495d9?w=600",
        badge: "Popular",
        category: "knife",
        description: "All-purpose santoku knife with VG-10 steel core. Ideal for vegetables, meat, and fish.",
        materials: "VG-10 steel, Magnolia wood handle",
        dimensions: "17cm blade length"
    },
    {
        id: 11,
        name: "Kasuri Textile Panel",
        artisan: "Matsuda Yui",
        location: "Ehime",
        price: 65000,
        image: "https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=600",
        badge: "Artisan",
        category: "textile",
        description: "Traditional ikat-dyed textile panel with geometric patterns. Hand-tied and naturally dyed.",
        materials: "Cotton, natural indigo",
        dimensions: "150cm × 100cm"
    },
    {
        id: 12,
        name: "Imari Dinner Set",
        artisan: "Shimizu Akiko",
        location: "Saga",
        price: 125000,
        image: "https://images.unsplash.com/photo-1585338107529-13adb9d6d4f6?w=600",
        badge: "Exclusive",
        category: "pottery",
        description: "12-piece hand-painted porcelain dinner service in traditional Imari colors of red, blue, and gold.",
        materials: "Fine porcelain, overglaze enamels",
        dimensions: "Complete service for 4"
    }
];

// Shopping cart
let cart = [];
let currentFilter = 'all';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Hide loader
    setTimeout(() => {
        const loader = document.getElementById('loader');
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
            initAnimations();
        }, 500);
    }, 1500);

    // Initialize map
    initMap();
    
    // Initialize products
    displayProducts(products);
    
    // Scroll effects
    initScrollEffects();
    
    // Load cart from localStorage
    loadCart();
});

// Initialize interactive map with custom markers
function initMap() {
    const map = L.map('japanMap', {
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true
    }).setView([36.2048, 138.2529], 6);
    
    // Custom tile layer with elegant styling
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 5
    }).addTo(map);

    // Add custom markers for each location
    craftLocations.forEach(location => {
        const markerClass = `marker-${location.type}`;
        
        const customIcon = L.divIcon({
            className: `custom-marker ${markerClass}`,
            html: `<div>${location.icon}</div>`,
            iconSize: [50, 50],
            iconAnchor: [25, 25],
            popupAnchor: [0, -25]
        });

        const marker = L.marker([location.lat, location.lng], { 
            icon: customIcon,
            riseOnHover: true
        }).addTo(map);

        // Enhanced popup content
        const popupContent = `
            <div class="location-popup">
                <div class="location-name">${location.name} ${location.nameJp}</div>
                <div class="location-specialty">${location.icon} ${location.specialty}</div>
                <p style="font-size: 0.85rem; color: #666; margin: 0.8rem 0;">${location.description}</p>
                <div class="location-count">${location.products} products available</div>
                <button class="view-products-btn" onclick="filterByLocation('${location.name}')">
                    View Products
                </button>
            </div>
        `;

        marker.bindPopup(popupContent, {
            maxWidth: 280,
            className: 'custom-popup'
        });

        // Animate marker on hover
        marker.on('mouseover', function(e) {
            this.openPopup();
        });
    });
}

// Display products with optional filtering
function displayProducts(productsToShow) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    if (productsToShow.length === 0) {
        grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 3rem; color: #999;">No products found in this category.</p>';
        return;
    }

    productsToShow.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-category', product.category);
        card.onclick = () => openProductModal(product);
        
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="product-badge">${product.badge}</div>
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-artisan">${product.artisan}</div>
                <div class="product-location">📍 ${product.location}, Japan</div>
                <div class="product-bottom">
                    <div class="product-price">¥${product.price.toLocaleString()}</div>
                    <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    // Animate cards
    gsap.from('.product-card', {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power2.out'
    });
}

// Open product detail modal
function openProductModal(product) {
    const modal = document.getElementById('productModal');
    const modalInner = document.getElementById('modalInner');
    
    modalInner.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; padding: 2rem;">
            <div>
                <img src="${product.image}" alt="${product.name}" style="width: 100%; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
            </div>
            <div style="padding: 1rem;">
                <div style="display: inline-block; background: linear-gradient(135deg, var(--gold), var(--red)); color: white; padding: 0.4rem 1rem; font-size: 0.7rem; letter-spacing: 0.1em; margin-bottom: 1rem; border-radius: 3px;">${product.badge}</div>
                <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 2.5rem; margin-bottom: 1rem; color: var(--charcoal);">${product.name}</h2>
                <p style="font-family: 'Noto Serif JP', serif; font-size: 1.1rem; color: #666; margin-bottom: 0.5rem;">Artisan: ${product.artisan}</p>
                <p style="color: var(--gold); font-weight: 600; margin-bottom: 2rem; font-size: 0.95rem;">📍 ${product.location}, Japan</p>
                
                <div style="background: var(--cream); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                    <h3 style="font-size: 1.1rem; margin-bottom: 1rem; color: var(--charcoal);">About This Craft</h3>
                    <p style="line-height: 1.8; margin-bottom: 1rem; color: #555;">${product.description}</p>
                    <div style="display: grid; gap: 0.8rem; font-size: 0.9rem;">
                        <div><strong>Materials:</strong> ${product.materials}</div>
                        <div><strong>Dimensions:</strong> ${product.dimensions}</div>
                        <div><strong>Category:</strong> ${product.category}</div>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1.5rem; border-top: 2px solid #ddd;">
                    <div style="font-size: 2rem; font-weight: 700; color: var(--charcoal);">¥${product.price.toLocaleString()}</div>
                    <button onclick="addToCart(${product.id}); closeProductModal();" style="padding: 1rem 2.5rem; background: linear-gradient(135deg, var(--gold), var(--red)); color: white; border: none; font-size: 0.9rem; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; border-radius: 6px; font-weight: 600; transition: all 0.3s ease;">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close product modal
function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Filter products by category
function filterProducts(category) {
    currentFilter = category;
    
    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter and display
    const filtered = category === 'all' 
        ? products 
        : products.filter(p => p.category === category);
    
    displayProducts(filtered);
}

// Filter products by location (from map)
function filterByLocation(location) {
    const filtered = products.filter(p => p.location === location);
    displayProducts(filtered);
    
    // Reset filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Scroll to products section
    document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Show notification
    showNotification(`Showing ${filtered.length} products from ${location}`);
}

// Shopping cart functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        cart.push(product);
        updateCartUI();
        saveCart();
        showNotification(`✓ ${product.name} added to cart!`);
    }
}

function removeFromCart(index) {
    const product = cart[index];
    cart.splice(index, 1);
    updateCartUI();
    saveCart();
    showNotification(`${product.name} removed from cart`);
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartFooter = document.getElementById('cartFooter');
    
    cartCount.textContent = cart.length;
    cartCount.style.display = cart.length > 0 ? 'block' : 'none';

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-bag" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                <p>Your cart is empty</p>
                <p style="font-size: 0.85rem; margin-top: 0.5rem; opacity: 0.7;">Discover authentic Japanese crafts</p>
            </div>
        `;
        cartFooter.style.display = 'none';
    } else {
        let total = 0;
        cartItems.innerHTML = cart.map((item, index) => {
            total += item.price;
            return `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-artisan">${item.artisan} • ${item.location}</div>
                        <div class="cart-item-price">¥${item.price.toLocaleString()}</div>
                    </div>
                    <span class="cart-item-remove" onclick="removeFromCart(${index})" title="Remove">
                        <i class="fas fa-trash"></i>
                    </span>
                </div>
            `;
        }).join('');
        cartTotal.textContent = `¥${total.toLocaleString()}`;
        cartFooter.style.display = 'block';
    }
}

function toggleCart() {
    const modal = document.getElementById('cartModal');
    const isActive = modal.classList.contains('active');
    
    if (isActive) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    } else {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Save and load cart
function saveCart() {
    localStorage.setItem('kazeCraftsCart', JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem('kazeCraftsCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    // Close cart modal
    toggleCart();
    
    // Open checkout modal
    const checkoutModal = document.getElementById('checkoutModal');
    checkoutModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Populate checkout summary
    updateCheckoutSummary();
    
    // Initialize Stripe Elements
    initializeStripeElements();
}

function closeCheckout() {
    const checkoutModal = document.getElementById('checkoutModal');
    checkoutModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function updateCheckoutSummary() {
    const checkoutItems = document.getElementById('checkoutItems');
    const checkoutSubtotal = document.getElementById('checkoutSubtotal');
    const checkoutTotal = document.getElementById('checkoutTotal');
    
    let subtotal = 0;
    
    checkoutItems.innerHTML = cart.map(item => {
        subtotal += item.price;
        return `
            <div class="checkout-item">
                <img src="${item.image}" alt="${item.name}" class="checkout-item-image">
                <div class="checkout-item-info">
                    <div class="checkout-item-name">${item.name}</div>
                    <div class="checkout-item-artisan">${item.artisan}</div>
                </div>
                <div class="checkout-item-price">¥${item.price.toLocaleString()}</div>
            </div>
        `;
    }).join('');
    
    checkoutSubtotal.textContent = `¥${subtotal.toLocaleString()}`;
    const total = subtotal + 2500; // Add shipping
    checkoutTotal.textContent = `¥${total.toLocaleString()}`;
}

// Initialize Stripe Elements
function initializeStripeElements() {
    // Create an instance of Elements
    elements = stripe.elements();
    
    // Create card element with custom styling
    const style = {
        base: {
            fontSize: '16px',
            color: '#1A1A1A',
            fontFamily: 'Inter, -apple-system, sans-serif',
            '::placeholder': {
                color: '#aab7c4'
            }
        },
        invalid: {
            color: '#C73E3A',
            iconColor: '#C73E3A'
        }
    };
    
    cardElement = elements.create('card', { style });
    cardElement.mount('#card-element');
    
    // Handle real-time validation errors
    cardElement.on('change', function(event) {
        const displayError = document.getElementById('card-errors');
        if (event.error) {
            displayError.textContent = event.error.message;
        } else {
            displayError.textContent = '';
        }
    });
    
    // Handle form submission
    const form = document.getElementById('checkoutForm');
    form.addEventListener('submit', handleCheckoutSubmit);
}

// Handle checkout form submission
async function handleCheckoutSubmit(event) {
    event.preventDefault();
    
    const payBtn = document.getElementById('payBtn');
    payBtn.disabled = true;
    payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    // Get form values
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const postalCode = document.getElementById('postalCode').value;
    const country = document.getElementById('country').value;
    
    // Calculate total
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const total = subtotal + 2500; // Add shipping
    
    try {
        // In a real implementation, you would:
        // 1. Send order details to your backend
        // 2. Backend creates a PaymentIntent with Stripe
        // 3. Backend returns the client_secret
        // 4. Frontend confirms the payment
        
        // For demo purposes, we'll simulate a successful payment
        await simulatePayment();
        
        // Show success
        showSuccessMessage(fullName, email, total);
        
        // Clear cart
        cart = [];
        saveCart();
        updateCartUI();
        
    } catch (error) {
        // Show error
        document.getElementById('card-errors').textContent = error.message;
        payBtn.disabled = false;
        payBtn.innerHTML = '<i class="fas fa-lock"></i> Complete Purchase';
    }
}

// Simulate payment (in production, this would be real Stripe payment)
function simulatePayment() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate 95% success rate
            if (Math.random() > 0.05) {
                resolve();
            } else {
                reject(new Error('Payment failed. Please try again.'));
            }
        }, 2000);
    });
}

// Show success message
function showSuccessMessage(name, email, total) {
    closeCheckout();
    
    const successHtml = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);" id="successOverlay">
            <div style="background: white; padding: 3rem; border-radius: 12px; text-align: center; max-width: 500px; box-shadow: 0 20px 80px rgba(0,0,0,0.3);">
                <div style="font-size: 4rem; margin-bottom: 1rem;">✓</div>
                <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 2.5rem; margin-bottom: 1rem; color: var(--charcoal);">Order Confirmed!</h2>
                <p style="font-size: 1.1rem; margin-bottom: 1rem; color: #666;">Thank you, ${name}!</p>
                <p style="margin-bottom: 2rem; color: #666;">Your order has been received and a confirmation email has been sent to <strong>${email}</strong></p>
                <div style="background: var(--cream); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                    <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">Order Total</div>
                    <div style="font-size: 2rem; font-weight: 700; color: var(--gold);">¥${total.toLocaleString()}</div>
                </div>
                <p style="font-size: 0.9rem; color: #666; margin-bottom: 2rem;">We'll send you tracking information once your items ship from our artisan partners.</p>
                <button onclick="document.getElementById('successOverlay').remove(); window.scrollTo({top: 0, behavior: 'smooth'});" style="padding: 1rem 2.5rem; background: linear-gradient(135deg, var(--gold), var(--red)); color: white; border: none; font-size: 0.9rem; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; border-radius: 6px; font-weight: 600;">
                    Continue Shopping
                </button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', successHtml);
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Placeholder functions for other nav icons
function toggleSearch() {
    showNotification('Search feature coming soon!');
}

function toggleWishlist() {
    showNotification('Wishlist feature coming soon!');
}

// Scroll to map
function scrollToMap() {
    document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Scroll effects
function initScrollEffects() {
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('mainNav');
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
}

// Initialize animations with GSAP
function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);
    
    // Hero animations
    const heroTimeline = gsap.timeline();
    heroTimeline
        .from('.hero-kanji', { 
            scale: 0.8, 
            opacity: 0, 
            duration: 1.2, 
            ease: 'power3.out' 
        })
        .from('.hero-title', { 
            y: 40, 
            opacity: 0, 
            duration: 1, 
            ease: 'power2.out' 
        }, '-=0.8')
        .from('.hero-subtitle', { 
            y: 30, 
            opacity: 0, 
            duration: 1, 
            ease: 'power2.out' 
        }, '-=0.6')
        .from('.hero-cta', { 
            scale: 0.9, 
            opacity: 0, 
            duration: 0.8, 
            ease: 'back.out(1.7)' 
        }, '-=0.4');

    // Section animations
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header.children, {
            y: 50,
            opacity: 0,
            stagger: 0.2,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: header,
                start: 'top 80%',
                toggleActions: 'play none none none'
            }
        });
    });
    
    // Map animation
    gsap.from('#japanMap', {
        scale: 0.95,
        opacity: 0,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '#japanMap',
            start: 'top 80%',
            toggleActions: 'play none none none'
        }
    });
}

// Handle clicks outside modals to close them
document.addEventListener('click', function(event) {
    const cartModal = document.getElementById('cartModal');
    const checkoutModal = document.getElementById('checkoutModal');
    const productModal = document.getElementById('productModal');
    
    if (event.target === cartModal) {
        toggleCart();
    }
    if (event.target === checkoutModal) {
        closeCheckout();
    }
    if (event.target === productModal) {
        closeProductModal();
    }
});

// Close modals with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const cartModal = document.getElementById('cartModal');
        const checkoutModal = document.getElementById('checkoutModal');
        const productModal = document.getElementById('productModal');
        
        if (cartModal.classList.contains('active')) toggleCart();
        if (checkoutModal.classList.contains('active')) closeCheckout();
        if (productModal.classList.contains('active')) closeProductModal();
    }
});

