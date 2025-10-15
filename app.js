// ===== STRIPE CONFIGURATION =====
// Stripe publishable key - LIVE AND ACTIVE
const STRIPE_PUBLIC_KEY = 'pk_test_51SHzYWCNZJjjYW2zUi60YWy5HYq827adGWVTTsvoGsSTQoezGdM2t9JxE63LuDSrM1pOAWDcqK9KsY0pSGQeztyN00qNGlxwWJ';

// Initialize Stripe (will be initialized properly when real key is added)
let stripe = null;
let elements = null;
let cardElement = null;

// Test Cards Data from STRIPE_TEST_CARDS.md
const TEST_CARDS = {
    success: [
        { number: '4242 4242 4242 4242', brand: 'Visa', desc: 'Standard success' },
        { number: '5555 5555 5555 4444', brand: 'Mastercard', desc: 'Standard success' },
        { number: '4000 0035 6000 0008', brand: 'Visa', desc: 'Japan (JPY)' }
    ],
    decline: [
        { number: '4000 0000 0000 0002', desc: 'Generic decline' },
        { number: '4000 0000 0000 9995', desc: 'Insufficient funds' },
        { number: '4000 0000 0000 0069', desc: 'Expired card' }
    ],
    auth: [
        { number: '4000 0025 0000 3155', desc: 'Requires 3D Secure' }
    ]
};

// Initialize Stripe (will retry if not loaded yet)
function initializeStripe() {
    try {
        if (typeof Stripe !== 'undefined') {
            if (STRIPE_PUBLIC_KEY && STRIPE_PUBLIC_KEY.startsWith('pk_test_')) {
                stripe = Stripe(STRIPE_PUBLIC_KEY);
                console.log('✅ Stripe initialized successfully!');
                console.log('💳 Ready to process payments');
                return true;
            } else {
                console.warn('⚠️ Invalid Stripe key');
                return false;
            }
        } else {
            console.warn('⚠️ Stripe.js not loaded yet, retrying...');
            return false;
        }
    } catch (error) {
        console.error('❌ Stripe initialization error:', error);
        return false;
    }
}

// Try to initialize immediately
initializeStripe();

// Retry on window load if needed
window.addEventListener('load', function() {
    if (!stripe) {
        console.log('Retrying Stripe initialization on window load...');
        initializeStripe();
    }
});

// ===== CRAFTSMEN DATA =====
// 12 Famous Japanese Pottery Styles + Other Crafts
const craftsmen = [
    // POTTERY MASTERS (12 Famous Styles)
    {
        id: 1,
        name: "Tanaka Hiroshi",
        nameJp: "田中 博",
        craft: "Raku Pottery",
        craftJp: "楽焼",
        location: "Kyoto",
        image: "face1.jpg",
        specialty: "Traditional Raku Tea Bowls",
        years: 35,
        story: "Born into a family of potters in Kyoto, Master Tanaka has dedicated his life to perfecting the ancient art of Raku-yaki. His tea bowls are renowned for their spontaneous beauty and spiritual depth, embodying the wabi-sabi aesthetic. Each piece is fired in a traditional anagama kiln, where flames dance and create unique patterns that cannot be replicated.",
        quote: "Clay remembers the hands that shaped it, fire reveals its true nature.",
        video: "https://www.youtube.com/embed/U4fErC9skHE"
    },
    {
        id: 2,
        name: "Yamamoto Keiko",
        nameJp: "山本 恵子",
        craft: "Kiyomizu-yaki",
        craftJp: "清水焼",
        location: "Kyoto",
        image: "face2.jpg",
        specialty: "Hand-Painted Porcelain",
        years: 28,
        story: "Master Yamamoto is one of the few female masters in the male-dominated world of Kiyomizu pottery. Her delicate hand-painted designs featuring seasonal flowers have won numerous awards. She combines traditional techniques with contemporary aesthetics, creating pieces that honor the past while embracing the future.",
        quote: "Every brushstroke carries 300 years of tradition, yet speaks to today.",
        video: "https://www.youtube.com/embed/U4fErC9skHE"
    },
    {
        id: 3,
        name: "Mori Kazuo",
        nameJp: "森 和夫",
        craft: "Bizen-yaki",
        craftJp: "備前焼",
        location: "Okayama",
        image: "face3.jpg",
        specialty: "Unglazed Stoneware",
        years: 42,
        story: "Fourth-generation Bizen master, Kazuo fires his works for 10 days straight in a climbing kiln fueled by red pine. The natural ash glaze and fire markings create patterns impossible to plan, making each piece unique. His works are collected by museums worldwide.",
        quote: "The kiln and I are partners in creation; fire is the final artist.",
        video: "https://www.youtube.com/embed/U4fErC9skHE"
    },
    {
        id: 4,
        name: "Kato Noboru",
        nameJp: "加藤 昇",
        craft: "Arita-yaki",
        craftJp: "有田焼",
        location: "Saga",
        image: "face4.jpg",
        specialty: "Blue & White Porcelain",
        years: 31,
        story: "Heir to a 400-year-old Arita porcelain workshop, Master Kato creates the finest sometsuke (blue and white) porcelain using cobalt oxide imported from the same mines as his ancestors. His intricate patterns require years of training to master.",
        quote: "Porcelain is frozen moonlight; cobalt is the sky captured in clay.",
        video: "https://www.youtube.com/embed/U4fErC9skHE"
    },
    {
        id: 5,
        name: "Shimizu Akiko",
        nameJp: "清水 明子",
        craft: "Imari-yaki",
        craftJp: "伊万里焼",
        location: "Saga",
        image: "face5.jpg",
        specialty: "Overglaze Enamel Decoration",
        years: 26,
        story: "Renowned for her intricate overglaze enamel work in vibrant reds, blues, and gold. Master Shimizu's Imari pieces are instantly recognizable for their elaborate patterns and perfect symmetry. She fires each piece multiple times to achieve the brilliant colors.",
        quote: "Color is emotion crystallized; pattern is poetry written in porcelain.",
        video: "https://www.youtube.com/embed/U4fErC9skHE"
    },
    {
        id: 6,
        name: "Nakamura Tetsuya",
        nameJp: "中村 哲也",
        craft: "Shigaraki-yaki",
        craftJp: "信楽焼",
        location: "Shiga",
        image: "face6.jpeg",
        specialty: "Natural Ash Glaze",
        years: 38,
        story: "Master Nakamura specializes in Shigaraki's characteristic orange-brown clay with natural ash glazing. His large vessels and sculptural works are favored by tea masters and collectors. The spontaneous beauty of his work embodies the Japanese concept of 'natural beauty.'",
        quote: "I shape the clay, but nature decorates it through fire and ash.",
        video: "https://www.youtube.com/embed/U4fErC9skHE"
    },
    {
        id: 7,
        name: "Saito Yumi",
        nameJp: "斎藤 由美",
        craft: "Kutani-yaki",
        craftJp: "九谷焼",
        location: "Ishikawa",
        image: "face7.jpg",
        specialty: "Five-Color Overglaze",
        years: 22,
        story: "Young master of Kutani's famous five-color technique (green, yellow, red, purple, and navy blue). Yumi's bold designs honor tradition while pushing boundaries. Her work has been exhibited in New York, Paris, and Dubai.",
        quote: "Kutani's five colors are the voice of Japanese seasons speaking eternally.",
        video: "https://www.youtube.com/embed/U4fErC9skHE"
    },
    {
        id: 8,
        name: "Watanabe Koji",
        nameJp: "渡辺 浩二",
        craft: "Mashiko-yaki",
        craftJp: "益子焼",
        location: "Tochigi",
        image: "face9.jpg",
        specialty: "Folk Pottery",
        years: 29,
        story: "Carrying on the mingei (folk craft) tradition of Mashiko, Master Watanabe creates functional pottery for everyday use. His thick glazes and earthy tones reflect the democratic ideals of the mingei movement - beauty in utility.",
        quote: "The best pottery is meant to be used, not just admired from afar.",
        video: "https://www.youtube.com/embed/U4fErC9skHE"
    },
    {
        id: 9,
        name: "Hayashi Yuki",
        nameJp: "林 武",
        craft: "Karatsu-yaki",
        craftJp: "唐津焼",
        location: "Saga",
        image: "face10.jpg",
        specialty: "Korean-Style Pottery",
        years: 33,
        story: "Master Hayashi preserves the 400-year-old tradition of Karatsu pottery, influenced by Korean ceramic techniques. His simple, rustic vessels are beloved by tea ceremony practitioners for their humble elegance and perfect imperfections.",
        quote: "In simplicity lies sophistication; in roughness, refinement.",
        video: "pottery2.mp4"
    },
    {
        id: 10,
        name: "Fujiwara Emi",
        nameJp: "藤原 恵美",
        craft: "Tokoname-yaki",
        craftJp: "常滑焼",
        location: "Aichi",
        image: "face11.jpg",
        specialty: "Teapots & Red Clay",
        years: 24,
        story: "Specialist in Tokoname's famous red clay teapots. Master Fujiwara's kyusu (teapots) are prized by tea enthusiasts worldwide for their ability to enhance tea flavor. The iron-rich clay develops a unique patina over time, improving with use.",
        quote: "A teapot is a vessel for not just tea, but for moments of peace.",
        video: "https://www.youtube.com/embed/U4fErC9skHE"
    },
    {
        id: 11,
        name: "Ito Masao",
        nameJp: "伊藤 正男",
        craft: "Seto-yaki",
        craftJp: "瀬戸焼",
        location: "Aichi",
        image: "face12.jpg",
        specialty: "Glazed Ceramics",
        years: 40,
        story: "From one of Japan's oldest pottery regions, Master Ito is a glaze specialist with over 200 glaze recipes in his collection. Each glaze is made from natural materials gathered from mountains and rivers around Seto. His pieces range from traditional to avant-garde.",
        quote: "Glaze is liquid stone transformed by fire into frozen waterfalls.",
        video: "https://www.youtube.com/embed/U4fErC9skHE"
    },
    {
        id: 12,
        name: "Takahashi Ryota",
        nameJp: "高橋 亮太",
        craft: "Hagi-yaki",
        craftJp: "萩焼",
        location: "Yamaguchi",
        image: "face13.webp",
        specialty: "Tea Ceremony Ware",
        years: 27,
        story: "Hagi pottery is known for changing color over time as tea seeps into its porous clay - a phenomenon called 'nanabake' (seven changes). Master Takahashi creates tea bowls that become more beautiful with each tea ceremony, embodying the passage of time.",
        quote: "True beauty reveals itself slowly, through patient use and time's passage.",
        video: "https://www.youtube.com/embed/U4fErC9skHE"
    },

    // OTHER CRAFT MASTERS
    {
        id: 13,
        name: "Fujiwara Takeshi",
        nameJp: "藤原 武",
        craft: "Blade Forging",
        craftJp: "刀鍛冶",
        location: "Gifu",
        image: "face15.jpg",
        specialty: "Damascus Kitchen Knives",
        years: 36,
        story: "Fourth-generation bladesmith from Seki, the legendary knife-making city. Master Fujiwara forge-welds 67 layers of steel to create stunning Damascus patterns. Each knife takes 2 weeks to complete and is sharpened to a 15-degree edge.",
        quote: "Steel has memory; respect it, and it will serve for generations.",
        video: "https://www.youtube.com/embed/d2rqpMJyLi8"
    },
    {
        id: 14,
        name: "Sato Michiko",
        nameJp: "佐藤 美智子",
        craft: "Kimono Weaving",
        craftJp: "着物織り",
        location: "Tokyo",
        image: "face5.jpg",
        specialty: "Hand-Painted Yuzen",
        years: 32,
        story: "Master of Kyo-yuzen, the ancient art of hand-painting silk. Michiko can paint 1000 cherry blossoms without repeating a single petal. Her kimono take 6-12 months to complete and are worn by celebrities and traditional performers worldwide.",
        quote: "Silk is like poetry - delicate yet powerful, temporary yet eternal.",
        video: "https://www.youtube.com/embed/qvPugcb7QGE"
    },
    {
        id: 15,
        name: "Okamoto Kenji",
        nameJp: "岡本 健二",
        craft: "Woodworking",
        craftJp: "木工芸",
        location: "Gifu",
        image: "face11.jpg",
        specialty: "Traditional Furniture",
        years: 41,
        story: "Master woodworker specializing in joinery techniques that require no nails or screws. His furniture uses only natural wood connections that tighten with age. Each piece is made from trees he personally selects and seasons for years.",
        quote: "Wood speaks if you listen; it tells you where it wants to be cut.",
        video: "https://www.youtube.com/embed/U4fErC9skHE"
    }
];

// ===== EXPANDED PRODUCTS DATA =====
const products = [
    // POTTERY
    {
        id: 1,
        name: "Midnight Moon Bowl",
        artisan: "Tanaka Hiroshi",
        location: "Kyoto",
        price: 85000,
        image: "pot1.webp",
        badge: "Master Craft",
        category: "pottery",
        description: "Exquisite Raku-fired tea bowl with deep black glaze and subtle crackle patterns.",
        materials: "Stoneware clay, natural ash glaze",
        dimensions: "12cm diameter × 8cm height"
    },
    {
        id: 2,
        name: "Bizen Tea Set",
        artisan: "Mori Kazuo",
        location: "Okayama",
        price: 95000,
        image: "pot2.jpg",
        badge: "Limited",
        category: "pottery",
        description: "Complete 5-piece tea ceremony set with natural hi-iro (scarlet) markings.",
        materials: "Bizen clay, wood ash finish",
        dimensions: "Teapot: 15cm, 4 cups included"
    },
    {
        id: 3,
        name: "Arita Blue Vase",
        artisan: "Kato Noboru",
        location: "Saga",
        price: 55000,
        image: "pot3.jpg",
        badge: "Classic",
        category: "pottery",
        description: "Traditional sometsuke blue and white porcelain vase with intricate floral patterns.",
        materials: "Fine porcelain, cobalt oxide underglaze",
        dimensions: "28cm height × 12cm diameter"
    },
    {
        id: 4,
        name: "Imari Dinner Set",
        artisan: "Shimizu Akiko",
        location: "Saga",
        price: 125000,
        image: "pot4.avif",
        badge: "Exclusive",
        category: "pottery",
        description: "12-piece hand-painted porcelain dinner service in traditional Imari colors.",
        materials: "Fine porcelain, overglaze enamels",
        dimensions: "Complete service for 4"
    },
    {
        id: 5,
        name: "Shigaraki Sake Set",
        artisan: "Nakamura Tetsuya",
        location: "Shiga",
        price: 42000,
        image: "pot5.webp",
        badge: "New",
        category: "pottery",
        description: "Natural ash-glazed sake bottle and 4 cups with rich orange-brown tones.",
        materials: "Shigaraki clay, natural ash glaze",
        dimensions: "Bottle: 18cm height"
    },

    // KIMONO & TEXTILES
    {
        id: 6,
        name: "Golden Crane Kimono",
        artisan: "Sato Michiko",
        location: "Tokyo",
        price: 250000,
        image: "pot6.webp",
        badge: "Masterpiece",
        category: "kimono",
        description: "Hand-painted silk kimono featuring golden cranes in flight.",
        materials: "100% Silk, natural dyes, gold thread",
        dimensions: "160cm length, fits sizes S-L"
    },
    {
        id: 7,
        name: "Sakura Silk Obi",
        artisan: "Sato Michiko",
        location: "Tokyo",
        price: 88000,
        image: "pot7.webp",
        badge: "Heritage",
        category: "kimono",
        description: "Premium woven silk obi belt with cherry blossom patterns.",
        materials: "100% Silk, natural dyes",
        dimensions: "360cm × 30cm"
    },

    // CUTLERY
    {
        id: 8,
        name: "Damascus Chef Knife",
        artisan: "Fujiwara Takeshi",
        location: "Gifu",
        price: 120000,
        image: "pot8.webp",
        badge: "Featured",
        category: "knife",
        description: "67-layer Damascus steel gyuto knife with octagonal ebony handle.",
        materials: "VG-10 core, Damascus steel, African Blackwood handle",
        dimensions: "24cm blade length"
    },
    {
        id: 9,
        name: "Santoku Kitchen Knife",
        artisan: "Fujiwara Takeshi",
        location: "Gifu",
        price: 45000,
        image: "pot9.jpg",
        badge: "Popular",
        category: "knife",
        description: "All-purpose santoku knife with VG-10 steel core.",
        materials: "VG-10 steel, Magnolia wood handle",
        dimensions: "17cm blade length"
    },

    // CHOPSTICKS
    {
        id: 10,
        name: "Ebony Chopsticks Set",
        artisan: "Okamoto Kenji",
        location: "Gifu",
        price: 15000,
        image: "pot10.jpg",
        badge: "Elegant",
        category: "chopsticks",
        description: "Premium African blackwood chopsticks with natural oil finish.",
        materials: "African Blackwood, food-safe oil",
        dimensions: "23cm length, 5 pairs"
    },
    {
        id: 11,
        name: "Lacquered Chopsticks",
        artisan: "Okamoto Kenji",
        location: "Gifu",
        price: 12000,
        image: "pot23.jpeg",
        badge: "Traditional",
        category: "chopsticks",
        description: "Hand-lacquered chopsticks with gold leaf accents.",
        materials: "Japanese cypress, urushi lacquer, gold leaf",
        dimensions: "24cm length, 2 pairs"
    },

    // HAND FANS
    {
        id: 12,
        name: "Sensu Folding Fan",
        artisan: "Sato Michiko",
        location: "Tokyo",
        price: 18000,
        image: "pot12.jpg",
        badge: "Art Piece",
        category: "fan",
        description: "Hand-painted silk sensu with bamboo ribs and sakura motif.",
        materials: "Silk, bamboo, natural pigments",
        dimensions: "21cm when folded, 38cm spread"
    },
    {
        id: 13,
        name: "Uchiwa Round Fan",
        artisan: "Sato Michiko",
        location: "Tokyo",
        price: 12000,
        image: "pot13.png",
        badge: "Summer",
        category: "fan",
        description: "Traditional non-folding fan with hand-dyed washi paper.",
        materials: "Washi paper, bamboo frame",
        dimensions: "24cm diameter"
    },
    {
        id: 14,
        name: "Artisan Tea Bowl",
        artisan: "Tanaka Hiroshi",
        location: "Kyoto",
        price: 68000,
        image: "pot14.jpg",
        badge: "Handcrafted",
        category: "pottery",
        description: "Unique hand-thrown tea bowl with natural glaze variations.",
        materials: "Stoneware clay, ash glaze",
        dimensions: "11cm diameter × 7cm height"
    },
    {
        id: 15,
        name: "Ceramic Sake Bottle",
        artisan: "Mori Kazuo",
        location: "Okayama",
        price: 52000,
        image: "pot15.jpg",
        badge: "Traditional",
        category: "pottery",
        description: "Elegant sake bottle with traditional glaze technique.",
        materials: "Stoneware clay, natural glaze",
        dimensions: "20cm height"
    },
    {
        id: 16,
        name: "Handcrafted Bowl Set",
        artisan: "Kato Noboru",
        location: "Saga",
        price: 78000,
        image: "pot16.jpg",
        badge: "Set",
        category: "pottery",
        description: "Set of 4 handcrafted bowls with unique patterns.",
        materials: "Porcelain, hand-painted glaze",
        dimensions: "15cm diameter each"
    },
    {
        id: 17,
        name: "Decorative Vase",
        artisan: "Shimizu Akiko",
        location: "Saga",
        price: 95000,
        image: "pot17.jpg",
        badge: "Art Piece",
        category: "pottery",
        description: "Stunning decorative vase with intricate detailing.",
        materials: "Fine porcelain, overglaze",
        dimensions: "35cm height"
    },
    {
        id: 18,
        name: "Tea Ceremony Set",
        artisan: "Nakamura Tetsuya",
        location: "Shiga",
        price: 145000,
        image: "pot5.webp",
        badge: "Premium",
        category: "pottery",
        description: "Complete tea ceremony set with traditional craftsmanship.",
        materials: "Shigaraki clay, ash glaze",
        dimensions: "Complete 6-piece set"
    },
    {
        id: 19,
        name: "Artisan Teapot",
        artisan: "Tanaka Hiroshi",
        location: "Kyoto",
        price: 72000,
        image: "pot19.webp",
        badge: "Handmade",
        category: "pottery",
        description: "Traditional teapot with elegant spout and handle design.",
        materials: "Stoneware clay, natural glaze",
        dimensions: "18cm width × 12cm height"
    },
    {
        id: 20,
        name: "Ceramic Plate Set",
        artisan: "Mori Kazuo",
        location: "Okayama",
        price: 58000,
        image: "pot20.jpg",
        badge: "Classic",
        category: "pottery",
        description: "Set of 6 handcrafted plates with traditional patterns.",
        materials: "Bizen clay, wood ash finish",
        dimensions: "25cm diameter each"
    },
    {
        id: 21,
        name: "Decorative Bowl",
        artisan: "Kato Noboru",
        location: "Saga",
        price: 48000,
        image: "pot21.jpg",
        badge: "Elegant",
        category: "pottery",
        description: "Beautiful decorative bowl with intricate glaze work.",
        materials: "Fine porcelain, cobalt oxide",
        dimensions: "20cm diameter × 10cm height"
    },
    {
        id: 22,
        name: "Master's Collection Vase",
        artisan: "Shimizu Akiko",
        location: "Saga",
        price: 185000,
        image: "pot22.webp",
        badge: "Masterpiece",
        category: "pottery",
        description: "Exquisite vase from master artisan's premium collection.",
        materials: "Fine porcelain, hand-painted overglaze",
        dimensions: "40cm height × 18cm diameter"
    },

    // WOODCRAFT
    {
        id: 14,
        name: "Cedar Jewelry Box",
        artisan: "Okamoto Kenji",
        location: "Gifu",
        price: 65000,
        image: "pot20.jpg",
        badge: "Handcrafted",
        category: "woodcraft",
        description: "Intricate joinery jewelry box made without nails or glue.",
        materials: "Japanese cedar, natural beeswax finish",
        dimensions: "20cm × 15cm × 12cm"
    },
    {
        id: 15,
        name: "Wooden Serving Tray",
        artisan: "Okamoto Kenji",
        location: "Gifu",
        price: 28000,
        image: "pot10.jpg",
        badge: "Functional Art",
        category: "woodcraft",
        description: "Minimalist serving tray with live edge and handles.",
        materials: "Walnut wood, food-safe oil",
        dimensions: "45cm × 30cm"
    },

    // LIQUOR
    {
        id: 16,
        name: "Junmai Daiginjo Sake",
        artisan: "Takahashi Brewery",
        location: "Niigata",
        price: 18000,
        image: "pot4.avif",
        badge: "Premium",
        category: "liquor",
        description: "Ultra-premium sake brewed with 35% polished rice.",
        materials: "Yamada Nishiki rice, mountain spring water",
        dimensions: "720ml bottle"
    },
    {
        id: 17,
        name: "Aged Shochu",
        artisan: "Takahashi Brewery",
        location: "Kyushu",
        price: 22000,
        image: "pot7.webp",
        badge: "Rare",
        category: "liquor",
        description: "10-year aged barley shochu in ceramic bottle.",
        materials: "Premium barley, koji rice",
        dimensions: "750ml ceramic bottle"
    }
];

// Shopping cart
let cart = [];
let currentFilter = 'all';

// Animation functions removed - using CSS and ASCII only

// Initialize app

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Content Loaded');
    console.log('📦 Products array length:', products.length);
    
    // Hide loader
    setTimeout(() => {
        const loader = document.getElementById('loader');
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
            initAnimations();
        }, 500);
    }, 1500);

    // Initialize everything
    initAOS();
    initLuxuryAnimations();
    initAdvancedAnimations();
    initCraftsmenGrid();
    initMap();
    displayProducts(products);
    initScrollEffects();
    initPartnerLanguage();
    initSmoothScroll();
    loadCart();
    updateProductCount();
    
    // Initialize mobile optimizations
    initMobileOptimizations();
    
    
    // Show Stripe setup status
    logStripeStatus();
});

// Log Stripe configuration status
function logStripeStatus() {
    console.log('\n%c🎨 Kaze Crafts - Payment System Status', 'font-size: 16px; font-weight: bold; color: #4A90E2;');
    
    // Ensure Stripe is initialized
    if (!stripe && typeof Stripe !== 'undefined') {
        initializeStripe();
    }
    
    if (stripe) {
        console.log('%c✅ Stripe Integration: LIVE & ACTIVE', 'color: #4caf50; font-weight: bold; font-size: 14px;');
        console.log('%c🔑 Key: ' + STRIPE_PUBLIC_KEY.substring(0, 20) + '...', 'color: #4caf50;');
        console.log('💳 Test cards available in checkout');
        console.log('🧪 Use: 4242 4242 4242 4242 (Visa success)');
        console.log('📖 See: STRIPE_TEST_CARDS.md for more test cards');
    } else {
        console.log('%c❌ Stripe Integration: FAILED', 'color: #ff0000; font-weight: bold;');
        console.log('⚠️ Stripe.js may not be loaded. Check console for errors.');
        console.log('🔄 Try refreshing the page (Cmd+Shift+R)');
    }
    
    console.log('\n📚 Documentation:');
    console.log('   • Active Key: STRIPE_ACTIVE.md');
    console.log('   • Test Cards: STRIPE_TEST_CARDS.md');
    console.log('   • Backend: stripe-backend-example.js');
    console.log('\n');
}

// ===== LUXURY INITIALIZATION =====
function initAOS() {
    // Detect mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    
    AOS.init({
        duration: isMobile ? 600 : 1200, // Faster animations on mobile
        easing: 'ease-out-cubic',
        once: true,
        offset: isMobile ? 20 : 50, // Trigger earlier on mobile
        delay: isMobile ? 0 : 100, // No delay on mobile
        disable: false // Keep enabled but optimize
    });
}

// Legacy carousel code removed - using spotlight system instead

function initLuxuryAnimations() {
    // GSAP Timeline for hero with animations
    gsap.registerPlugin(ScrollTrigger);
    
    const tl = gsap.timeline();
    
    // Only animate elements that exist
    if (document.querySelector('.hero-logo')) {
        tl.from('.hero-logo', { 
            scale: 0.9, 
            opacity: 0, 
            y: 30,
            duration: 1.2, 
            ease: 'power3.out' 
        });
    }
    
    if (document.querySelector('.hero-title')) {
        tl.from('.hero-title', { 
            opacity: 0, 
            y: 20,
            duration: 0.8, 
            ease: 'power2.out' 
        }, '-=0.6');
    }
    
    if (document.querySelector('.hero-description')) {
        tl.from('.hero-description', { 
            opacity: 0, 
            duration: 0.6, 
            ease: 'power2.out' 
        }, '-=0.4');
    }
    
    if (document.querySelector('.hero-actions')) {
        tl.from('.hero-actions button', { 
            scale: 0.95,
            opacity: 0, 
            duration: 0.5,
            stagger: 0.1,
            ease: 'back.out(1.5)' 
        }, '-=0.3');
    }
}

// Hero carousel removed - not being used

// ===== CRAFTSMEN GRID =====
let currentSpotlightIndex = 0;
let artisanAutoAdvance = null;
let artisanPaused = false;

function initCraftsmenGrid() {
    // Find Hayashi Yuki and move to first position
    const hayashiIndex = craftsmen.findIndex(c => c.name === "Hayashi Yuki");
    if (hayashiIndex > 0) {
        const hayashi = craftsmen.splice(hayashiIndex, 1)[0];
        craftsmen.unshift(hayashi);
    }
    
    // Randomize the rest (keep first position)
    const first = craftsmen[0];
    const rest = craftsmen.slice(1);
    shuffleArray(rest);
    craftsmen.length = 0;
    craftsmen.push(first, ...rest);
    
    displaySpotlightArtisan(0);
    updateCounter();
    startArtisanAutoAdvance();
    
    // Add pause/resume on hover and touch
    const spotlightContainer = document.querySelector('.artisan-spotlight-container');
    if (spotlightContainer) {
        // Desktop: pause on hover
        spotlightContainer.addEventListener('mouseenter', pauseArtisanAutoAdvance);
        spotlightContainer.addEventListener('mouseleave', resumeArtisanAutoAdvance);
        
        // Mobile: pause on touch, resume after delay
        spotlightContainer.addEventListener('touchstart', pauseArtisanAutoAdvance, { passive: true });
        spotlightContainer.addEventListener('touchend', () => {
            setTimeout(resumeArtisanAutoAdvance, 5000); // Resume after 5 seconds
        }, { passive: true });
    }
}

// Start auto-advance timer
function startArtisanAutoAdvance() {
    // Clear existing timer
    if (artisanAutoAdvance) {
        clearInterval(artisanAutoAdvance);
    }
    
    // Auto-advance every 6 seconds
    artisanAutoAdvance = setInterval(() => {
        if (!artisanPaused) {
            nextArtisan();
        }
    }, 6000);
}

// Pause auto-advance
function pauseArtisanAutoAdvance() {
    artisanPaused = true;
}

// Resume auto-advance
function resumeArtisanAutoAdvance() {
    artisanPaused = false;
}

// Shuffle array helper function
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function displaySpotlightArtisan(index) {
    const artisan = craftsmen[index];
    currentSpotlightIndex = index;
    
    // Detect mobile
    const isMobile = window.innerWidth <= 768;
    
    const spotlight = document.getElementById('artisanSpotlight');
    const portrait = document.getElementById('spotlightPortrait');
    const details = document.getElementById('spotlightDetails');
    
    // Add fade-out animation
    spotlight.style.opacity = '0';
    spotlight.style.transform = 'translateX(-30px)';
    
    setTimeout(() => {
        // Update portrait
        portrait.innerHTML = `<img src="${artisan.image}" alt="${artisan.name}" loading="lazy" onerror="this.src='face1.jpg'">`;
        
        // Get artisan products for both mobile and desktop
        let artisanProducts = products.filter(p => p.artisan === artisan.name);
    
    if (artisanProducts.length === 0) {
        const randomProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, 3);
        artisanProducts = randomProducts;
    } else if (artisanProducts.length > 3) {
        artisanProducts = artisanProducts.slice(0, 3);
    }
    
        // Mobile-optimized version (NOW WITH PRODUCTS!)
        if (isMobile) {
            details.innerHTML = `
            <div class="spotlight-craft-label">${artisan.craft}</div>
            <h2 class="spotlight-name">${artisan.name}</h2>
            <p class="spotlight-name-jp">${artisan.nameJp} • ${artisan.craftJp}</p>
            <p class="spotlight-bio">${artisan.specialty}</p>
            <div class="spotlight-meta">
                <div class="meta-item">
                    <span class="meta-label">Location</span>
                    <span class="meta-value">${artisan.location}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Experience</span>
                    <span class="meta-value">${artisan.years} Years</span>
                </div>
            </div>
            
            <!-- Featured Works on Mobile -->
            <div class="artisan-products-preview mobile-products">
                <h4>Featured Works</h4>
                <div class="artisan-products-grid mobile-grid">
                    ${artisanProducts.map(product => `
                        <div class="artisan-product-mini" onclick="openProductById(${product.id})">
                            <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='pot1.webp'">
                            <div class="product-mini-info">
                                <div class="product-mini-name">${product.name}</div>
                                <div class="product-mini-price">¥${product.price.toLocaleString()}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <button class="spotlight-cta ripple" onclick="openCraftsmanModal(${artisan.id})">
                View Full Story
            </button>
        `;
        } else {
            // Desktop version with products
            details.innerHTML = `
            <div class="spotlight-craft-label">${artisan.craft}</div>
            <h2 class="spotlight-name">${artisan.name}</h2>
            <p class="spotlight-name-jp">${artisan.nameJp} • ${artisan.craftJp}</p>
            <p class="spotlight-bio">${artisan.bio || artisan.specialty}</p>
            <div class="spotlight-meta">
                <div class="meta-item">
                    <span class="meta-label">Location</span>
                    <span class="meta-value">${artisan.location}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Experience</span>
                    <span class="meta-value">${artisan.years} Years</span>
                </div>
            </div>
            
            <!-- Artisan Products Preview -->
            <div class="artisan-products-preview">
                <h4>Featured Works</h4>
                <div class="artisan-products-grid">
                    ${artisanProducts.map(product => `
                        <div class="artisan-product-mini" onclick="openProductById(${product.id})">
                            <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='pot1.webp'">
                            <div class="product-mini-info">
                                <div class="product-mini-name">${product.name}</div>
                                <div class="product-mini-price">¥${product.price.toLocaleString()}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <button class="spotlight-cta ripple" onclick="filterByArtisan('${artisan.name}')">
                View All Works
            </button>
            <button class="spotlight-cta-secondary ripple" onclick="openCraftsmanModal(${artisan.id})" style="margin-top: 0.5rem;">
                View Full Story
            </button>
        `;
        }
        
        // Update counter
        updateCounter();
        
        // Fade-in animation with slide
        setTimeout(() => {
            spotlight.style.opacity = '1';
            spotlight.style.transform = 'translateX(0)';
        }, 50);
    }, 300); // Wait for fade-out before updating content
}

function updateCounter() {
    const currentEl = document.getElementById('currentArtisan');
    const totalEl = document.getElementById('totalArtisans');
    if (currentEl) currentEl.textContent = currentSpotlightIndex + 1;
    if (totalEl) totalEl.textContent = craftsmen.length;
}

function nextArtisan() {
    currentSpotlightIndex = (currentSpotlightIndex + 1) % craftsmen.length;
    displaySpotlightArtisan(currentSpotlightIndex);
    // Reset timer when manually navigated
    startArtisanAutoAdvance();
}

function prevArtisan() {
    currentSpotlightIndex = (currentSpotlightIndex - 1 + craftsmen.length) % craftsmen.length;
    displaySpotlightArtisan(currentSpotlightIndex);
    // Reset timer when manually navigated
    startArtisanAutoAdvance();
}

// ===== CRAFTSMAN MODAL =====
function openCraftsmanModal(id) {
    const craftsman = craftsmen.find(c => c.id === id);
    if (!craftsman) return;
    
    const modal = document.getElementById('craftsmanModal');
    const inner = document.getElementById('craftsmanModalInner');
    
    const isLocalVideo = craftsman.video && (craftsman.video.includes('.mp4') || craftsman.video.includes('.mov') || craftsman.video.includes('.webm'));
    
    inner.innerHTML = `
        <div class="craftsman-modal-grid">
            <div class="craftsman-modal-left">
                <img src="${craftsman.image}" alt="${craftsman.name}" class="craftsman-modal-image" onerror="this.src='face1.jpg'">
                <div class="craftsman-modal-video">
                    ${isLocalVideo 
                        ? `<video controls autoplay loop muted playsinline class="craftsman-video" onerror="this.style.display='none'">
                            <source src="${craftsman.video}" type="video/mp4">
                            <source src="pottery.mp4" type="video/mp4">
                            Your browser does not support the video tag.
                           </video>`
                        : `<iframe src="${craftsman.video}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
                    }
                </div>
            </div>
            <div class="craftsman-modal-right">
                <div class="craftsman-modal-label">${craftsman.craft}</div>
                <h2 class="craftsman-modal-name">${craftsman.name}</h2>
                <p class="craftsman-modal-name-jp">${craftsman.nameJp} | ${craftsman.craftJp}</p>
                <div class="craftsman-modal-meta">
                    <span>📍 ${craftsman.location}</span>
                    <span>⏱️ ${craftsman.years} years</span>
                    <span>✨ ${craftsman.specialty}</span>
                </div>
                
                <div class="craftsman-modal-story">
                    <h3>The Story</h3>
                    <p>${craftsman.story}</p>
                </div>
                
                <div class="craftsman-modal-quote">
                    <i class="fas fa-quote-left"></i>
                    <p>${craftsman.quote}</p>
                </div>
                
                <button class="craftsman-modal-browse" onclick="filterByArtisan('${craftsman.name}')">
                    Browse ${craftsman.name}'s Works
                </button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCraftsmanModal() {
    const modal = document.getElementById('craftsmanModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ===== PRODUCT UTILITIES =====
function updateProductCount() {
    const countElement = document.getElementById('productsCount');
    const grid = document.getElementById('productsGrid');
    const count = grid.children.length;
    if (countElement) {
        countElement.textContent = count;
    }
}

function sortProducts(sortBy) {
    let sorted = [...products];
    
    switch(sortBy) {
        case 'price-low':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sorted.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
            sorted.reverse();
            break;
        case 'featured':
        default:
            // Keep original order
            break;
    }
    
    if (currentFilter !== 'all') {
        sorted = sorted.filter(p => p.category === currentFilter);
    }
    
    displayProducts(sorted);
}

// ===== MAP (Keeping your awesome map!) =====
const craftLocations = [
    {
        name: "Kyoto",
        nameJp: "京都",
        lat: 35.0116,
        lng: 135.7681,
        type: "pottery",
        icon: "🏺",
        specialty: "Kyo-yaki & Raku Pottery",
        products: 45
    },
    {
        name: "Tokyo",
        nameJp: "東京",
        lat: 35.6762,
        lng: 139.6503,
        type: "kimono",
        icon: "👘",
        specialty: "Edo Kimono & Yuzen",
        products: 78
    },
    {
        name: "Gifu",
        nameJp: "岐阜",
        lat: 35.3912,
        lng: 136.7223,
        type: "knife",
        icon: "🔪",
        specialty: "Seki Cutlery",
        products: 92
    },
    {
        name: "Saga",
        nameJp: "佐賀",
        lat: 33.2492,
        lng: 130.2988,
        type: "pottery",
        icon: "🏺",
        specialty: "Arita & Imari Porcelain",
        products: 108
    },
    {
        name: "Okayama",
        nameJp: "岡山",
        lat: 34.6555,
        lng: 133.9195,
        type: "pottery",
        icon: "🏺",
        specialty: "Bizen Pottery",
        products: 63
    }
];

let mainMap = null;
let expandedMap = null;

function initMap() {
    mainMap = createMap('japanMap', [36.2048, 138.2529], 6);
}

function createMap(containerId, center, zoom) {
    const map = L.map(containerId).setView(center, zoom);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    craftLocations.forEach(location => {
        const customIcon = L.divIcon({
            className: `custom-marker marker-${location.type}`,
            html: `<div>${location.icon}</div>`,
            iconSize: [50, 50],
            iconAnchor: [25, 25]
        });

        const marker = L.marker([location.lat, location.lng], { icon: customIcon })
            .addTo(map);

        const popupContent = `
            <div class="location-popup">
                <div class="location-name">${location.name} ${location.nameJp}</div>
                <div class="location-specialty">${location.icon} ${location.specialty}</div>
                <div class="location-count">${location.products} products available</div>
                <button class="view-products-btn" onclick="filterByLocation('${location.name}')">
                    <i class="fas fa-eye"></i> View Products
                </button>
            </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 280 });
    });
    
    return map;
}

// Expand map to full screen
function expandMap() {
    const modal = document.getElementById('mapModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Initialize expanded map if not already done
    setTimeout(() => {
        if (!expandedMap) {
            expandedMap = createMap('japanMapExpanded', [36.2048, 138.2529], 7);
        }
        // Invalidate size to ensure proper rendering
        expandedMap.invalidateSize();
    }, 100);
}

// Close expanded map
function closeMapModal() {
    const modal = document.getElementById('mapModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ===== PRODUCT FUNCTIONS =====
function displayProducts(productsToShow) {
    console.log('🔍 displayProducts called with:', productsToShow.length, 'products');
    const grid = document.getElementById('productsGrid');
    console.log('🔍 Grid element found:', grid);
    
    if (!grid) {
        console.error('❌ productsGrid element not found!');
        return;
    }
    
    grid.innerHTML = '';

    if (productsToShow.length === 0) {
        console.log('⚠️ No products to show');
        grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 3rem;">No products found.</p>';
        return;
    }

    productsToShow.forEach((product, index) => {
        console.log(`🔍 Creating product card ${index + 1}:`, product.name);
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-category', product.category);
        
        // Show price and open modal when clicking on card (except buttons)
        card.onclick = (e) => {
            if (!e.target.closest('button')) {
                // Show price if hidden
                const priceElement = card.querySelector('.product-price-large');
                if (!priceElement.classList.contains('visible')) {
                    priceElement.classList.add('visible');
                }
                // Open modal
                openProductModal(product);
            }
        };
        
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='pot1.webp'">
                ${product.badge && product.badge.toLowerCase() === 'new' ? `<div class="product-badge">${product.badge}</div>` : ''}
            </div>
            <div class="product-info">
                <div class="product-category-label">${product.category.toUpperCase()}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-artisan">${product.artisan}</div>
                <div class="product-location">📍 ${product.location}</div>
                <div class="product-price-large">¥${product.price.toLocaleString()}</div>
                <div class="product-actions">
                    <button class="product-stripe-btn" onclick="event.stopPropagation(); initiateStripeCheckout(${product.id})">
                        <i class="fas fa-lock"></i> Buy Now
                    </button>
                    <button class="product-cart-btn" onclick="event.stopPropagation(); addToCart(${product.id})">
                        <i class="fas fa-shopping-cart"></i> Cart
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
        console.log(`✅ Card ${index + 1} added to grid`);
    });
    
    console.log('🎯 Total cards in grid:', grid.children.length);
    
    // Initialize autoscroll after products are rendered
    // Reset initialization flag to allow re-initialization
    setTimeout(() => {
        console.log('🔄 Attempting autoscroll init from displayProducts');
        if (!autoScrollInitialized) {
            tryInitAutoScroll();
        } else {
            console.log('✅ Autoscroll already active');
        }
    }, 300);
}

// Helper function to open product by ID
function openProductById(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        // Close artisan modal if open
        const artisanModal = document.getElementById('craftsmanModal');
        if (artisanModal && artisanModal.classList.contains('active')) {
            closeCraftsmanModal();
        }
        
        // Scroll to products section first
        const productsSection = document.getElementById('collections');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Wait for scroll to complete, then open modal
            setTimeout(() => {
                openProductModal(product);
            }, 600);
        } else {
            // If no products section, just open modal
            openProductModal(product);
        }
    }
}

function openProductModal(product) {
    const modal = document.getElementById('productModal');
    const modalInner = document.getElementById('modalInner');
    
    const isMobile = window.innerWidth <= 768;
    
    modalInner.innerHTML = `
        <div style="display: grid; grid-template-columns: ${isMobile ? '1fr' : '1fr 1fr'}; gap: ${isMobile ? '1rem' : '1.5rem'}; padding: ${isMobile ? '1rem' : '1.5rem'};">
            <div>
                <img src="${product.image}" alt="${product.name}" style="width: 100%; border-radius: 8px;" onerror="this.src='pot1.webp'">
            </div>
            <div style="padding: ${isMobile ? '0' : '0.5rem'};">
                <div style="display: inline-block; background: #000000; color: white; padding: 0.3rem 0.8rem; font-size: 0.65rem; margin-bottom: 0.8rem; border-radius: 3px;">${product.badge}</div>
                <h2 style="font-family: 'Cinzel', serif; font-size: ${isMobile ? '1.5rem' : '2rem'}; margin-bottom: 0.8rem; color: #000000; line-height: 1.2;">${product.name}</h2>
                <p style="font-family: 'Noto Serif JP', serif; font-size: ${isMobile ? '0.9rem' : '1rem'}; color: #666; margin-bottom: 0.3rem;">By ${product.artisan}</p>
                <p style="color: #000000; font-weight: 600; margin-bottom: 1rem; font-size: ${isMobile ? '0.85rem' : '0.95rem'};">📍 ${product.location}</p>
                
                <div style="background: #f5f5f5; padding: ${isMobile ? '1rem' : '1.2rem'}; border-radius: 8px; margin-bottom: 1rem;">
                    <h3 style="margin-bottom: 0.8rem; color: #000000; font-size: ${isMobile ? '1rem' : '1.1rem'};">About</h3>
                    <p style="line-height: 1.6; margin-bottom: 0.8rem; color: #333; font-size: ${isMobile ? '0.85rem' : '0.95rem'};">${product.description}</p>
                    <div style="display: grid; gap: 0.5rem; font-size: ${isMobile ? '0.8rem' : '0.85rem'}; color: #333;">
                        <div><strong>Materials:</strong> ${product.materials}</div>
                        <div><strong>Dimensions:</strong> ${product.dimensions}</div>
                    </div>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 0.8rem; padding-top: 1rem; border-top: 2px solid #ddd;">
                    <div style="font-size: ${isMobile ? '1.5rem' : '1.8rem'}; font-weight: 700; color: #000000;">¥${product.price.toLocaleString()}</div>
                    <button onclick="initiateStripeCheckout(${product.id})" style="padding: ${isMobile ? '1rem 1.5rem' : '1.1rem 1.8rem'}; background: #635BFF; color: white; border: none; font-size: ${isMobile ? '0.85rem' : '0.9rem'}; cursor: pointer; border-radius: 6px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                        <i class="fas fa-lock"></i> Buy Now
                    </button>
                    <button onclick="addToCart(${product.id}); closeProductModal();" style="padding: ${isMobile ? '0.9rem 1.5rem' : '1rem 1.8rem'}; background: #000000; color: white; border: none; font-size: ${isMobile ? '0.8rem' : '0.85rem'}; cursor: pointer; border-radius: 6px; font-weight: 600;">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ===== STRIPE CHECKOUT =====
function initiateStripeCheckout(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Add to cart and go to checkout
    addToCart(productId);
    toggleCart();
    setTimeout(() => {
        proceedToCheckout();
    }, 300);
    
    showNotification(`${product.name} added to cart - proceeding to checkout`, 'success');
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function filterProducts(category) {
    currentFilter = category;
    
    // Update active state for all filter button types
    document.querySelectorAll('.filter-btn-luxury, .filter-btn-redesign, .filter-chip').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    const filtered = category === 'all' ? products : products.filter(p => p.category === category);
    displayProducts(filtered);
    updateProductCount();
    
    // Add smooth transition effect
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        productsGrid.style.animation = 'none';
        setTimeout(() => {
            productsGrid.style.animation = 'fadeInGrid 0.8s ease-out';
        }, 10);
    }
    
    // Show elegant notification
    const categoryNames = {
        'all': 'All Items',
        'pottery': 'Pottery',
        'kimono': 'Kimono & Textiles',
        'knife': 'Cutlery',
        'chopsticks': 'Chopsticks',
        'fan': 'Hand Fans',
        'woodcraft': 'Woodcraft',
        'liquor': 'Sake & Spirits'
    };
    showNotification(`Showing ${filtered.length} ${categoryNames[category] || category}`);
}

function filterByLocation(location) {
    const filtered = products.filter(p => p.location === location);
    displayProducts(filtered);
    updateProductCount();
    
    // Scroll to marketplace products section
    const productsSection = document.querySelector('.marketplace-products-luxury');
    if (productsSection) {
        setTimeout(() => {
            productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
    } else {
        document.getElementById('collections').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    showNotification(`✨ ${filtered.length} exquisite items from ${location}`);
    
    // Reset filter buttons and highlight the location connection
    document.querySelectorAll('.filter-btn-luxury').forEach(btn => btn.classList.remove('active'));
    
    // Add subtle highlight animation to products grid
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        productsGrid.style.animation = 'none';
        setTimeout(() => {
            productsGrid.style.animation = 'fadeInGrid 0.8s ease-out';
        }, 10);
    }
}

function filterByArtisan(artisan) {
    closeCraftsmanModal();
    const filtered = products.filter(p => p.artisan === artisan);
    displayProducts(filtered);
    updateProductCount();
    
    // Scroll to marketplace
    document.getElementById('collections').scrollIntoView({ behavior: 'smooth', block: 'start' });
    showNotification(`${filtered.length} works by ${artisan}`);
    
    // Reset filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
}

// ===== CART FUNCTIONS =====
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
    showNotification(`${product.name} removed`);
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartFooter = document.getElementById('cartFooter');
    
    cartCount.textContent = cart.length;
    cartCount.style.display = cart.length > 0 ? 'block' : 'none';

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart"><i class="fas fa-shopping-bag" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem;"></i><p>Your cart is empty</p></div>';
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
                        <div class="cart-item-artisan">${item.artisan}</div>
                        <div class="cart-item-price">¥${item.price.toLocaleString()}</div>
                    </div>
                    <span class="cart-item-remove" onclick="removeFromCart(${index})">
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
    modal.classList.toggle('active');
    document.body.style.overflow = modal.classList.contains('active') ? 'hidden' : 'auto';
}

function saveCart() {
    localStorage.setItem('kazeCraftsCart', JSON.stringify(cart));
}

function loadCart() {
    const saved = localStorage.getItem('kazeCraftsCart');
    if (saved) {
        cart = JSON.parse(saved);
        updateCartUI();
    }
}

// ===== CHECKOUT (Same as before) =====
function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    toggleCart();
    const checkoutModal = document.getElementById('checkoutModal');
    checkoutModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    updateCheckoutSummary();
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
                <img src="${item.image}" class="checkout-item-image">
                <div class="checkout-item-info">
                    <div class="checkout-item-name">${item.name}</div>
                    <div class="checkout-item-artisan">${item.artisan}</div>
                </div>
                <div class="checkout-item-price">¥${item.price.toLocaleString()}</div>
            </div>
        `;
    }).join('');
    
    checkoutSubtotal.textContent = `¥${subtotal.toLocaleString()}`;
    checkoutTotal.textContent = `¥${(subtotal + 2500).toLocaleString()}`;
}

function initializeStripeElements() {
    const cardElementDiv = document.getElementById('card-element');
    const cardErrors = document.getElementById('card-errors');
    
    // Ensure Stripe is initialized
    if (!stripe && typeof Stripe !== 'undefined') {
        initializeStripe();
    }
    
    // Check if Stripe is available
    if (!stripe || !cardElementDiv) {
        console.error('❌ Stripe not available or card element not found');
        if (cardElementDiv) {
            cardElementDiv.innerHTML = `
                <div style="padding: 2rem; background: #ffe6e6; border: 2px solid #ff4444; border-radius: 8px; text-align: center;">
                    <p style="margin-bottom: 1rem; font-weight: 600; color: #cc0000;">❌ Payment System Error</p>
                    <p style="color: #cc0000; margin-bottom: 1rem;">Stripe is not properly loaded. Please refresh the page.</p>
                    <button onclick="location.reload()" style="padding: 0.8rem 1.5rem; background: #cc0000; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                        Refresh Page
                    </button>
                </div>
            `;
        }
        return;
    }
    
    try {
        elements = stripe.elements();
        cardElement = elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#1A1A1A',
                    fontFamily: 'Cinzel, serif',
                    '::placeholder': { color: '#aab7c4' },
                    iconColor: '#4A90E2'
                },
                invalid: {
                    color: '#e5424d',
                    iconColor: '#e5424d'
                }
            },
            hidePostalCode: true
        });
        
        cardElement.mount('#card-element');
        
        // Add test card helper
        addTestCardHelper();
        
        cardElement.on('change', function(event) {
            if (cardErrors) {
                if (event.error) {
                    cardErrors.textContent = event.error.message;
                    cardErrors.style.display = 'block';
                } else {
                    cardErrors.textContent = '';
                    cardErrors.style.display = 'none';
                }
            }
        });
        
        document.getElementById('checkoutForm').addEventListener('submit', handleCheckoutSubmit);
        
        console.log('✅ Stripe Elements initialized');
    } catch (error) {
        console.error('Error initializing Stripe Elements:', error);
        if (cardErrors) {
            cardErrors.textContent = 'Error loading payment form. Please refresh the page.';
            cardErrors.style.display = 'block';
        }
    }
}

// Add test card helper UI
function addTestCardHelper() {
    const cardElement = document.getElementById('card-element');
    if (!cardElement || !cardElement.parentElement) return;
    
    const helper = document.createElement('div');
    helper.className = 'test-card-helper';
    helper.innerHTML = `
        <div style="margin-top: 1rem; padding: 1rem; background: #e3f2fd; border-radius: 8px; border: 1px solid #2196f3;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <strong style="color: #1565c0; font-size: 0.9rem;">🧪 Test Cards</strong>
                <button type="button" onclick="toggleTestCards()" style="background: none; border: none; color: #1565c0; cursor: pointer; font-size: 0.85rem; text-decoration: underline;">
                    Show/Hide
                </button>
            </div>
            <div id="testCardList" style="display: none; font-size: 0.85rem; color: #1565c0;">
                <div style="margin-top: 0.5rem;">
                    <strong>✅ Success:</strong>
                    ${TEST_CARDS.success.map(card => `
                        <button type="button" onclick="fillTestCard('${card.number}')" style="display: block; background: white; border: 1px solid #2196f3; padding: 0.5rem; margin: 0.3rem 0; border-radius: 4px; width: 100%; text-align: left; cursor: pointer; font-family: monospace; font-size: 0.8rem;">
                            ${card.number} - ${card.brand} (${card.desc})
                        </button>
                    `).join('')}
                </div>
                <div style="margin-top: 0.8rem; font-size: 0.75rem; opacity: 0.8;">
                    CVV: Any 3 digits (e.g., 123)<br>
                    Expiry: Any future date (e.g., 12/34)<br>
                    ZIP: Any 5 digits (e.g., 12345)
                </div>
            </div>
        </div>
    `;
    
    cardElement.parentElement.insertBefore(helper, cardElement.nextSibling);
}

// Toggle test card list
window.toggleTestCards = function() {
    const list = document.getElementById('testCardList');
    if (list) {
        list.style.display = list.style.display === 'none' ? 'block' : 'none';
    }
}

// Fill test card (for demonstration - actual filling handled by Stripe)
window.fillTestCard = function(cardNumber) {
    showNotification(`Use test card: ${cardNumber} with CVV: 123, Expiry: 12/34`, 'info');
    const list = document.getElementById('testCardList');
    if (list) list.style.display = 'none';
}

async function handleCheckoutSubmit(event) {
    event.preventDefault();
    const payBtn = document.getElementById('payBtn');
    const cardErrors = document.getElementById('card-errors');
    
    payBtn.disabled = true;
    payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    // Check if Stripe is available
    if (!stripe || !cardElement) {
        // Demo mode - simulate success
        console.log('Demo mode - simulating successful payment');
        await simulateDemoPayment();
        return;
    }
    
    try {
        // Get form data
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const address = document.getElementById('address').value;
        const city = document.getElementById('city').value;
        const postalCode = document.getElementById('postalCode').value;
        const country = document.getElementById('country').value;
        
        // Calculate total in JPY (no decimals for JPY)
        const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
        const shipping = 2500;
        const total = subtotal + shipping;
        
        // Create payment method
        const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
            billing_details: {
                name: fullName,
                email: email,
                address: {
                    line1: address,
                    city: city,
                    postal_code: postalCode,
                    country: country
                }
            }
        });
        
        if (pmError) {
            throw pmError;
        }
        
        console.log('✅ Payment Method created:', paymentMethod.id);
        
        // In production, send to your backend
        const response = await createPaymentIntent(total, paymentMethod.id, {
            customerName: fullName,
            customerEmail: email,
            items: cart,
            shipping: { address, city, postalCode, country }
        });
        
        if (response.error) {
            throw new Error(response.error);
        }
        
        // Handle payment confirmation if needed
        if (response.requiresAction) {
            const { error: confirmError } = await stripe.confirmCardPayment(response.clientSecret);
            if (confirmError) {
                throw confirmError;
            }
        }
        
        // Success!
        showSuccessMessage(fullName, email, total);
        cart = [];
        saveCart();
        updateCartUI();
        
    } catch (error) {
        console.error('Payment error:', error);
        if (cardErrors) {
            cardErrors.textContent = error.message || 'Payment failed. Please try again.';
            cardErrors.style.display = 'block';
        }
        payBtn.disabled = false;
        payBtn.innerHTML = '<i class="fas fa-lock"></i> Complete Purchase';
    }
}

// Simulate demo payment (when Stripe not configured)
async function simulateDemoPayment() {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const total = cart.reduce((sum, item) => sum + item.price, 0) + 2500;
    showSuccessMessage(
        document.getElementById('fullName').value, 
        document.getElementById('email').value, 
        total
    );
    cart = [];
    saveCart();
    updateCartUI();
}

// Create Payment Intent (Backend API call)
async function createPaymentIntent(amount, paymentMethodId, metadata) {
    // This would call your backend API
    // For now, return demo success
    
    console.log('💡 Backend API call needed:');
    console.log('POST /api/create-payment-intent');
    console.log('Body:', { amount, paymentMethodId, metadata });
    
    // DEMO MODE: Simulate successful backend response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                paymentIntentId: 'pi_demo_' + Date.now(),
                clientSecret: 'demo_secret_' + Date.now()
            });
        }, 1500);
    });
    
    /* 
    // PRODUCTION CODE (uncomment when backend is ready):
    try {
        const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: amount,
                currency: 'jpy',
                payment_method: paymentMethodId,
                metadata: metadata,
                confirm: true,
                return_url: window.location.origin + '/payment-success'
            })
        });
        
        if (!response.ok) {
            throw new Error('Payment failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Backend error:', error);
        return { error: error.message };
    }
    */
}

function showSuccessMessage(name, email, total) {
    closeCheckout();
    const successHtml = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);" id="successOverlay">
            <div style="background: white; padding: 3rem; border-radius: 12px; text-align: center; max-width: 500px;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">✓</div>
                <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 2.5rem; margin-bottom: 1rem;">Order Confirmed!</h2>
                <p style="margin-bottom: 2rem;">Thank you, ${name}! Confirmation sent to ${email}</p>
                <div style="background: var(--cream); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                    <div style="font-size: 2rem; font-weight: 700; color: var(--gold);">¥${total.toLocaleString()}</div>
                </div>
                <button onclick="document.getElementById('successOverlay').remove();" style="padding: 1rem 2.5rem; background: linear-gradient(135deg, var(--gold), var(--red)); color: white; border: none; cursor: pointer; border-radius: 6px; font-weight: 600;">
                    Continue Shopping
                </button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', successHtml);
}

// ===== FORM HANDLERS =====
function submitPartnerForm(event) {
    event.preventDefault();
    showNotification('Application submitted! We\'ll contact you within 2 business days.');
    event.target.reset();
}

function submitContactForm(event) {
    event.preventDefault();
    showNotification('Message sent! We\'ll respond within 24 hours.');
    event.target.reset();
}

// ===== UTILITIES =====
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add appropriate icon
    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
    notification.innerHTML = `<span style="margin-right: 0.5rem;">${icon}</span>${message}`;
    
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, type === 'error' ? 5000 : 3000);
}

function toggleSearch() {
    showNotification('Search feature coming soon!');
}

function toggleWishlist() {
    showNotification('Wishlist feature coming soon!');
}

// Mobile menu toggle
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    if (mobileMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

// Toggle products view (collapse/expand)
function toggleProductsView() {
    const productsGrid = document.getElementById('productsGrid');
    const toggleBtn = document.getElementById('toggleProductsBtn');
    
    if (!productsGrid || !toggleBtn) return;
    
    productsGrid.classList.toggle('collapsed');
    toggleBtn.classList.toggle('collapsed');
    
    // Update icon direction
    const icon = toggleBtn.querySelector('i');
    if (productsGrid.classList.contains('collapsed')) {
        icon.className = 'fas fa-chevron-down';
    } else {
        icon.className = 'fas fa-chevron-up';
    }
}

// Initialize partner section with Japanese default
function initPartnerLanguage() {
    // Set Japanese as default
    const langOption = document.querySelector('.lang-option[onclick*="jp"]');
    const langBtn = document.querySelector('.lang-btn[onclick*="jp"]');
    
    if (langOption) {
        switchPartnerLanguageText('jp', langOption);
    } else if (langBtn) {
        switchPartnerLanguage('jp', langBtn);
    }
}

// Partner section language toggle (new text-based version)
function switchPartnerLanguageText(lang, clickedElement) {
    // Update active states
    document.querySelectorAll('.lang-option').forEach(opt => {
        opt.classList.remove('active');
    });
    clickedElement.classList.add('active');
    
    // Call existing language switch logic
    switchPartnerLanguageContent(lang);
}

// Legacy function support and content switching
function switchPartnerLanguage(lang, clickedButton) {
    // Support for old button-based toggle (if any exist)
    if (clickedButton && clickedButton.classList) {
        document.querySelectorAll('.lang-btn, .lang-option').forEach(btn => {
            btn.classList.remove('active');
        });
        clickedButton.classList.add('active');
    }
    switchPartnerLanguageContent(lang);
}

function switchPartnerLanguageContent(lang) {
    // Update all text elements
    document.querySelectorAll('[data-jp][data-en]').forEach(element => {
        if (lang === 'jp') {
            element.textContent = element.getAttribute('data-jp');
        } else {
            element.textContent = element.getAttribute('data-en');
        }
    });
    
    // Update form placeholders
    document.querySelectorAll('[data-placeholder-jp][data-placeholder-en]').forEach(input => {
        if (lang === 'jp') {
            input.placeholder = input.getAttribute('data-placeholder-jp');
        } else {
            input.placeholder = input.getAttribute('data-placeholder-en');
        }
    });
    
    // Update select options
    document.querySelectorAll('select option[data-jp][data-en]').forEach(option => {
        if (lang === 'jp') {
            option.textContent = option.getAttribute('data-jp');
        } else {
            option.textContent = option.getAttribute('data-en');
        }
    });
}

function scrollToMap() {
    document.getElementById('map').scrollIntoView({ behavior: 'smooth' });
}

function initScrollEffects() {
    let lastScrollY = 0;
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        lastScrollY = window.scrollY;
        
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const nav = document.getElementById('mainNav');
                if (lastScrollY > 100) {
                    nav.classList.add('scrolled');
                } else {
                    nav.classList.remove('scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}


function initAdvancedAnimations() {
    // Initialize Splitting.js for text animations
    if (typeof Splitting !== 'undefined') {
        Splitting();
    }
    
    // Anime.js animations for floating elements
    if (typeof anime !== 'undefined') {
        // Animate section badges
        anime({
            targets: '.section-badge',
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 800,
            easing: 'easeOutQuad',
            delay: anime.stagger(200)
        });
        
        // Floating animation for cards (excluding video cards to prevent autoplay interference)
        anime({
            targets: '.product-card, .craftsman-card',
            translateY: [20, 0],
            opacity: [0, 1],
            duration: 1000,
            easing: 'easeOutCubic',
            delay: anime.stagger(100, {start: 300})
        });
    }
}

function initSmoothScroll() {
    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || !href) return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add parallax effect to images on scroll
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                
                // Parallax for product images
                document.querySelectorAll('.product-image img').forEach(img => {
                    const rect = img.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        const speed = 0.5;
                        img.style.transform = `translateY(${(rect.top - window.innerHeight / 2) * speed * 0.01}px) scale(1.1)`;
                    }
                });
                
                ticking = false;
            });
            ticking = true;
        }
    });
}

function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);
    
    // Animate section headers with stagger
    gsap.utils.toArray('.section-header, .artisans-header-luxury, .video-header-cinematic, .marketplace-header-luxury').forEach(header => {
        gsap.from(header.children, {
            y: 50,
            opacity: 0,
            stagger: 0.2,
            duration: 1,
            scrollTrigger: {
                trigger: header,
                start: 'top 80%',
                once: true
            }
        });
    });
    
    // Animate map with scale
    gsap.from('#japanMap', {
        scale: 0.95,
        opacity: 0,
        duration: 1.2,
        scrollTrigger: {
            trigger: '#japanMap',
            start: 'top 80%',
            once: true
        }
    });
    
    // Parallax effect for craftsman element
    gsap.to('.craftsman-element', {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero-minimalist',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
        }
    });
    
    // Stagger animation for grid items
    gsap.utils.toArray('.artisans-masonry-grid .craftsman-card').forEach((card, index) => {
        gsap.from(card, {
            y: 60,
            opacity: 0,
            duration: 0.8,
            delay: index * 0.05,
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                once: true
            }
        });
    });
    
    // Video cards entrance animation - disabled to prevent autoplay interference
    // gsap.utils.toArray('.video-card-cinematic').forEach((card, index) => {
    //     gsap.from(card, {
    //         y: 80,
    //         opacity: 0,
    //         duration: 1,
    //         delay: index * 0.15,
    //         scrollTrigger: {
    //             trigger: card,
    //             start: 'top 85%',
    //             once: true
    //         }
    //     });
    // });
    
    // Products grid animation
    gsap.utils.toArray('.products-grid-luxury .product-card').forEach((card, index) => {
        gsap.from(card, {
            y: 50,
            opacity: 0,
            duration: 0.7,
            delay: index * 0.05,
            scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                once: true
            }
        });
    });
}

// Close modals on Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeProductModal();
        closeCraftsmanModal();
        closeMapModal();
        const cartModal = document.getElementById('cartModal');
        const checkoutModal = document.getElementById('checkoutModal');
        if (cartModal.classList.contains('active')) toggleCart();
        if (checkoutModal.classList.contains('active')) closeCheckout();
    }
});

// ===== ASCII VIDEO EFFECT REMOVED =====
// ASCII design removed per user request for cleaner, faster site

// Mobile optimizations
function initMobileOptimizations() {
    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isMobile) {
        // Add mobile class to body
        document.body.classList.add('mobile-device');
        
        // Disable hover effects on mobile
        const style = document.createElement('style');
        style.textContent = `
            .mobile-device *:hover {
                transform: none !important;
                box-shadow: none !important;
            }
            
            .mobile-device .product-card:hover {
                transform: none !important;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06) !important;
            }
            
            .mobile-device .craftsman-card:hover {
                transform: none !important;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
            }
        `;
        document.head.appendChild(style);
        
        // Optimize scroll performance
        let ticking = false;
        function updateScroll() {
            ticking = false;
        }
        
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateScroll);
                ticking = true;
            }
        }
        
        // Throttle scroll events
        window.addEventListener('scroll', requestTick, { passive: true });
        
        // Optimize video loading
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            video.preload = 'metadata';
            video.setAttribute('playsinline', '');
        });
        
        // Add touch-friendly button interactions
        const buttons = document.querySelectorAll('button, .hero-btn, .btn-explore, .btn-artisans, .product-stripe-btn, .product-cart-btn');
        buttons.forEach(button => {
            button.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            }, { passive: true });
            
            button.addEventListener('touchend', function() {
                this.style.transform = '';
            }, { passive: true });
            
            button.addEventListener('touchcancel', function() {
                this.style.transform = '';
            }, { passive: true });
        });
        
        // Prevent zoom on input focus (iOS)
        if (isIOS) {
            const inputs = document.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('focus', function() {
                    document.querySelector('meta[name="viewport"]').setAttribute('content', 
                        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
                });
                
                input.addEventListener('blur', function() {
                    document.querySelector('meta[name="viewport"]').setAttribute('content', 
                        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
                });
            });
        }
    }
}

// Auto-scrolling Products - Continuous smooth scroll (MOBILE & DESKTOP)
function initProductAutoScroll() {
    console.log('🎬 initProductAutoScroll called');
    const productsGrid = document.getElementById('productsGrid');
    
    // Enable auto-scroll for ALL devices
    if (!productsGrid) {
        console.warn('⚠️ productsGrid not found, cannot init autoscroll');
        return null;
    }
    
    console.log('✅ productsGrid found:', productsGrid);
    console.log('📊 Grid children count:', productsGrid.children.length);
    console.log('📏 Grid scrollWidth:', productsGrid.scrollWidth, 'clientWidth:', productsGrid.clientWidth);
    
    // Check if there's content to scroll
    if (productsGrid.scrollWidth <= productsGrid.clientWidth) {
        console.warn('⚠️ No scrollable content yet, will retry...');
        return null;
    }
    
    let scrollDirection = 1; // 1 = right, -1 = left
    let isScrolling = true;
    let animationFrame = null;
    let isPageVisible = true;
    
    // Smooth auto-scroll function
    function autoScroll() {
        if (!isScrolling || !isPageVisible) {
            animationFrame = null;
            return;
        }
        
        // Always use horizontal scroll for products grid (mobile and desktop now both horizontal)
        const maxScroll = productsGrid.scrollWidth - productsGrid.clientWidth;
        const currentScroll = productsGrid.scrollLeft;
        
        // Scroll speed - slower for readability
        const scrollSpeed = 0.3;
        
        // Check boundaries and reverse direction
        if (currentScroll >= maxScroll - 1) {
            scrollDirection = -1; // Start scrolling left
        } else if (currentScroll <= 1) {
            scrollDirection = 1; // Start scrolling right
        }
        
        // Apply horizontal scroll for all devices
        productsGrid.scrollLeft += scrollSpeed * scrollDirection;
        
        // Continue animation
        animationFrame = requestAnimationFrame(autoScroll);
    }
    
    function startScrolling() {
        if (animationFrame) return; // Already running
        console.log('▶️ Starting autoscroll');
        isScrolling = true;
        autoScroll();
    }
    
    function stopScrolling() {
        console.log('⏸️ Pausing autoscroll');
        isScrolling = false;
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    }
    
    // Pause on hover (desktop only)
    productsGrid.addEventListener('mouseenter', stopScrolling);
    
    // Resume on mouse leave
    productsGrid.addEventListener('mouseleave', startScrolling);
    
    // Pause on touch start (mobile)
    productsGrid.addEventListener('touchstart', stopScrolling, { passive: true });
    
    // Resume after touch end with delay
    productsGrid.addEventListener('touchend', function() {
        setTimeout(startScrolling, 2000);
    }, { passive: true });
    
    // Handle visibility change (pause when tab not visible)
    function handleVisibilityChange() {
        isPageVisible = !document.hidden;
        if (isPageVisible) {
            startScrolling();
        } else {
            stopScrolling();
        }
    }
    
    // Listen for visibility changes
    if (typeof document.hidden !== 'undefined') {
        document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    
    // Start auto-scrolling after delay
    setTimeout(startScrolling, 1000);
    console.log('✅ Autoscroll initialized successfully');
    
    // Return cleanup function
    return function cleanup() {
        stopScrolling();
        productsGrid.removeEventListener('mouseenter', stopScrolling);
        productsGrid.removeEventListener('mouseleave', startScrolling);
        productsGrid.removeEventListener('touchstart', stopScrolling);
        productsGrid.removeEventListener('touchend', startScrolling);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
}

// Initialize auto-scroll when products are loaded
let autoScrollCleanup = null;
let autoScrollInitialized = false;

function tryInitAutoScroll() {
    console.log('🔄 Attempting to initialize autoscroll...');
    
    if (autoScrollInitialized) {
        console.log('✅ Autoscroll already initialized');
        return true;
    }
    
    const productsGrid = document.getElementById('productsGrid');
    
    if (!productsGrid) {
        console.warn('⚠️ productsGrid element not found yet');
        return false;
    }
    
    console.log('📦 Products grid found, children:', productsGrid.children.length);
    
    // Check if products grid exists and has content
    if (productsGrid.children.length > 0) {
        const result = initProductAutoScroll();
        if (result) {
            autoScrollCleanup = result;
            autoScrollInitialized = true;
            console.log('✅ Autoscroll initialization successful');
            return true;
        } else {
            console.warn('⚠️ initProductAutoScroll returned null, will retry');
            return false;
        }
    }
    
    console.warn('⚠️ Products grid has no children yet');
    return false;
}

// Multiple initialization strategies for reliability
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM Content Loaded - attempting autoscroll init');
    
    // Strategy 1: Try immediately
    if (tryInitAutoScroll()) return;
    
    // Strategy 2: Try after 500ms
    setTimeout(function() {
        console.log('🔄 Retry 1 (500ms)');
        if (tryInitAutoScroll()) return;
        
        // Strategy 3: Try after 1500ms
        setTimeout(function() {
            console.log('🔄 Retry 2 (1500ms)');
            if (tryInitAutoScroll()) return;
            
            // Strategy 4: Try after 3000ms (final attempt)
            setTimeout(function() {
                console.log('🔄 Retry 3 (3000ms - final attempt)');
                tryInitAutoScroll();
            }, 3000);
        }, 1500);
    }, 500);
});

// Also try on window load as backup
window.addEventListener('load', function() {
    console.log('🌍 Window loaded - checking autoscroll');
    if (!autoScrollInitialized) {
        console.log('🔄 Attempting autoscroll init on window load');
        setTimeout(tryInitAutoScroll, 500);
    }
});

// Auto-play Artistry in Motion videos when they come into view
document.addEventListener('DOMContentLoaded', function() {
    const videos = document.querySelectorAll('.craft-video');
    
    if (videos.length === 0) return;
    
    // Create intersection observer to detect when videos are visible
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            
            if (entry.isIntersecting) {
                // Video is visible - start playing
                video.play().catch(err => {
                    // Handle autoplay restrictions
                    console.log('Video autoplay prevented:', err);
                });
            } else {
                // Video is not visible - pause it
                video.pause();
            }
        });
    }, {
        threshold: 0.5, // Trigger when 50% of video is visible
        rootMargin: '0px'
    });
    
    // Observe all craft videos
    videos.forEach(video => {
        // Set video to muted (required for autoplay)
        video.muted = true;
        video.setAttribute('muted', '');
        
        // Observe the video
        videoObserver.observe(video);
    });
});
