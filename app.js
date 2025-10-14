// ===== STRIPE CONFIGURATION =====
// Replace with your actual Stripe publishable key
// Get your key from: https://dashboard.stripe.com/test/apikeys
const STRIPE_PUBLIC_KEY = 'pk_test_51234567890REPLACEME'; // TODO: Replace with your real test key

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

// Try to initialize Stripe
try {
    if (typeof Stripe !== 'undefined') {
        // Check if we have a valid key (not the placeholder)
        if (STRIPE_PUBLIC_KEY && !STRIPE_PUBLIC_KEY.includes('REPLACEME')) {
            stripe = Stripe(STRIPE_PUBLIC_KEY);
            console.log('✅ Stripe initialized with test key');
        } else {
            console.warn('⚠️ Stripe key not configured. Using demo mode.');
            console.log('📝 Add your Stripe test key to enable payments');
        }
    }
} catch (error) {
    console.error('Stripe initialization error:', error);
}

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

// ===== ANIMATED GRADIENT BACKGROUND =====
function initHeroThreeJS() {
    // Particles removed - using CSS animated gradient instead
    // The gradient animation is handled in CSS with @keyframes gradientFlow
}

// ===== SMART WORD-BY-WORD ANIMATION =====
function initBilingualAnimation() {
    const tagline = document.getElementById('dynamicTagline');
    if (!tagline) return;

    const phrases = [
        { text: '日本の職人技', lang: 'jp' },
        { text: 'Authentic Japanese Craftsmanship', lang: 'en' }
    ];
    
    let currentPhraseIndex = 0;
    
    function animateWords(phrase) {
        const words = phrase.text.split(' ');
        const lang = phrase.lang;
        
        // Create a temporary container to maintain fixed height
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.width = '100%';
        tempContainer.style.opacity = '0';
        
        // Create spans for each word
        words.forEach((word, index) => {
            const span = document.createElement('span');
            span.className = `word-${lang}`;
            span.textContent = word;
            span.style.animationDelay = `${index * 0.1}s`;
            tempContainer.appendChild(span);
            
            // Add space except for Japanese
            if (lang === 'en' && index < words.length - 1) {
                tempContainer.appendChild(document.createTextNode(' '));
            }
        });
        
        // Replace content smoothly
        tagline.innerHTML = '';
        tagline.appendChild(tempContainer);
        
        // Fade in
        setTimeout(() => {
            tempContainer.style.position = 'relative';
            tempContainer.style.opacity = '1';
        }, 50);
    }
    
    function transitionToNextPhrase() {
        // Fade out current with stable positioning
        const currentContent = tagline.firstChild;
        if (currentContent) {
            currentContent.style.opacity = '0';
        }
        
        setTimeout(() => {
            currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
            animateWords(phrases[currentPhraseIndex]);
        }, 400);
    }
    
    // Initial phrase
    animateWords(phrases[0]);
    
    // Start cycling after 4 seconds, then every 5 seconds
    setTimeout(() => {
        transitionToNextPhrase();
        setInterval(transitionToNextPhrase, 5000);
    }, 4000);
}

// ===== WIND CANVAS ANIMATION (KAZE) =====
function initFluidCanvas() {
    // Disabled - using ASCII effects only
    return;
}

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
    // initParticles(); // Disabled - using ASCII only
    initLuxuryAnimations();
    initAdvancedAnimations();
    initArtisanCarousel();
    initCraftsmenGrid();
    initMap();
    displayProducts(products);
    initScrollEffects();
    
    // Initialize partner section with Japanese default
    initPartnerLanguage();
    // initFluidCanvas(); // Disabled - using ASCII only
    // initBilingualAnimation(); // Removed - text removed from hero
    initSmoothScroll();
    loadCart();
    updateProductCount();
    
    // Initialize ASCII effect for partner section background
    initPartnerASCII();
    
    // Initialize mobile optimizations
    initMobileOptimizations();
    
    // Initialize ASCII effect for hero video
    initHeroASCII();
    
    
    // Show Stripe setup status
    logStripeStatus();
});

// Log Stripe configuration status
function logStripeStatus() {
    console.log('\n%c🎨 Kaze Crafts - Payment System Status', 'font-size: 16px; font-weight: bold; color: #50C878;');
    
    if (stripe) {
        console.log('%c✅ Stripe Integration: ACTIVE', 'color: #4caf50; font-weight: bold;');
        console.log('💳 Test cards available in checkout');
        console.log('📖 See: STRIPE_TEST_CARDS.md');
    } else {
        console.log('%c⚠️ Stripe Integration: DEMO MODE', 'color: #ff9800; font-weight: bold;');
        console.log('📝 To enable Stripe payments:');
        console.log('   1. Get your test key from: https://dashboard.stripe.com/test/apikeys');
        console.log('   2. Open app.js and replace STRIPE_PUBLIC_KEY (line 4)');
        console.log('   3. See: STRIPE_QUICK_START.md for 5-minute setup guide');
    }
    
    console.log('\n📚 Documentation:');
    console.log('   • Quick Start: STRIPE_QUICK_START.md');
    console.log('   • Full Setup: STRIPE_SETUP_GUIDE.md');
    console.log('   • Test Cards: STRIPE_TEST_CARDS.md');
    console.log('   • Backend Example: stripe-backend-example.js');
    console.log('\n');
}

// ===== LUXURY INITIALIZATION =====
function initAOS() {
    AOS.init({
        duration: 1200,
        easing: 'ease-out-cubic',
        once: true,
        offset: 50,
        delay: 100
    });
}

function initParticles() {
    // Disabled - using ASCII effects only
    return;
}

// ===== SPLIT SCREEN ARTISAN CAROUSEL WITH ART IMAGES =====
let currentArtisanIndex = 0;
let artisanCarouselInterval;
const artImages = [
    'art1.jpg',
    'art2.jpg',
    'art3.jpg',
    'art4.jpg',
    'art5.jpg',
    'art6.jpg'
];

function initArtisanCarousel() {
    const carouselSplit = document.getElementById('artisanCarouselSplit');
    
    if (!carouselSplit) return;
    
    // Create slides with art images
    artImages.forEach((imagePath, index) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide-split';
        if (index === 0) slide.classList.add('active');
        slide.style.backgroundImage = `url('${imagePath}')`;
        
        carouselSplit.appendChild(slide);
    });
    
    startArtisanCarousel();
}

function updateCarouselSlide() {
    const slides = document.querySelectorAll('.carousel-slide-split');
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === currentArtisanIndex);
    });
}

let progressInterval;

function startArtisanCarousel() {
    clearInterval(artisanCarouselInterval);
    clearInterval(progressInterval);
    
    const duration = 6000; // 6 seconds as requested
    const progressBar = document.getElementById('carouselProgressBar');
    
    let progress = 0;
    
    // Reset and start progress bar
    if (progressBar) {
        progressBar.style.width = '0%';
    }
    
    progressInterval = setInterval(() => {
        progress += 100 / (duration / 50);
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
        if (progress >= 100) {
            progress = 0;
        }
    }, 50);
    
    // Start the carousel interval
    artisanCarouselInterval = setInterval(() => {
        nextArtisan();
        progress = 0;
        if (progressBar) {
            progressBar.style.width = '0%';
        }
    }, duration);
}

function nextArtisan() {
    currentArtisanIndex = (currentArtisanIndex + 1) % artImages.length;
    updateCarouselSlide();
    // Restart progress on manual click
    clearInterval(progressInterval);
    const progressBar = document.getElementById('carouselProgressBar');
    if (progressBar) {
        progressBar.style.width = '0%';
    }
    let progress = 0;
    progressInterval = setInterval(() => {
        progress += 100 / (2500 / 50);
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
    }, 50);
}

function prevArtisan() {
    currentArtisanIndex = (currentArtisanIndex - 1 + artImages.length) % artImages.length;
    updateCarouselSlide();
    // Restart progress on manual click
    clearInterval(progressInterval);
    const progressBar = document.getElementById('carouselProgressBar');
    if (progressBar) {
        progressBar.style.width = '0%';
    }
    let progress = 0;
    progressInterval = setInterval(() => {
        progress += 100 / (2500 / 50);
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
    }, 50);
}

// Legacy carousel code for compatibility
function initArtisanCarouselOld() {
    const carouselBg = document.getElementById('artisanCarouselBg');
    const dotsContainer = document.getElementById('carouselDots');
    
    if (!carouselBg || !dotsContainer) return;
    
    // Create background slides
    featuredArtisans.forEach((artisan, index) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-bg-slide';
        slide.style.backgroundImage = `url('${artisan.image}')`;
        if (index === 0) slide.classList.add('active');
        carouselBg.appendChild(slide);
        
        // Create dots
        const dot = document.createElement('div');
        dot.className = 'carousel-dot';
        if (index === 0) dot.classList.add('active');
        dot.onclick = () => goToArtisanSlide(index);
        dotsContainer.appendChild(dot);
    });
    
    // Set first artisan
    updateArtisanCard(0);
    
    // Start auto-rotation
    startArtisanCarousel();
    
    // Pause on hover
    const storyCard = document.getElementById('artisanStoryCard');
    if (storyCard) {
        storyCard.addEventListener('mouseenter', () => clearInterval(artisanCarouselInterval));
        storyCard.addEventListener('mouseleave', startArtisanCarousel);
    }
}

function startArtisanCarousel() {
    clearInterval(artisanCarouselInterval);
    artisanCarouselInterval = setInterval(() => {
        currentArtisanIndex = (currentArtisanIndex + 1) % featuredArtisans.length;
        goToArtisanSlide(currentArtisanIndex);
    }, 5000); // Change every 5 seconds
}

function goToArtisanSlide(index) {
    currentArtisanIndex = index;
    
    // Update backgrounds
    const slides = document.querySelectorAll('.carousel-bg-slide');
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
    
    // Update dots
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
    
    // Update card with animation
    updateArtisanCard(index);
}

function updateArtisanCard(index) {
    const artisan = featuredArtisans[index];
    
    // Fade out
    const storyCard = document.getElementById('artisanStoryCard');
    if (!storyCard) return;
    
    storyCard.style.opacity = '0';
    storyCard.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        // Update content
        document.getElementById('storyCardImg').src = artisan.image;
        document.getElementById('storyCardImg').alt = artisan.name;
        document.getElementById('storyCardLabel').textContent = artisan.craft;
        document.getElementById('storyCardName').textContent = artisan.name;
        document.getElementById('storyCardNameJp').textContent = `${artisan.nameJp} | ${artisan.craftJp}`;
        document.getElementById('storyCardCraft').textContent = `${artisan.years} years of mastery`;
        
        // Set click handler
        document.getElementById('storyCardBtn').onclick = () => openCraftsmanModal(artisan.id);
        
        // Fade in
        storyCard.style.opacity = '1';
        storyCard.style.transform = 'translateY(0)';
    }, 300);
}

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

// ===== HERO CAROUSEL =====
function initHeroCarousel() {
    const slidesContainer = document.getElementById('craftsmanSlides');
    
    // Add featured craftsmen to hero carousel
    craftsmen.slice(0, 6).forEach(craftsman => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide craftsman-slide';
        slide.innerHTML = `
            <div class="craftsman-slide-bg" style="background-image: url('${craftsman.image}')"></div>
            <div class="craftsman-slide-overlay"></div>
            <div class="craftsman-slide-content">
                <div class="craftsman-label">${craftsman.craft}</div>
                <h2 class="craftsman-name-hero">${craftsman.name}</h2>
                <p class="craftsman-name-jp">${craftsman.nameJp}</p>
                <p class="craftsman-location">📍 ${craftsman.location}</p>
                <p class="craftsman-years">${craftsman.years} years of mastery</p>
                <button class="craftsman-story-btn" onclick="openCraftsmanModal(${craftsman.id})">
                    My Story
                </button>
            </div>
        `;
        slidesContainer.appendChild(slide);
    });
    
    // Initialize Swiper
    new Swiper('.craftsman-swiper', {
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
        speed: 1500,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        loop: true
    });
}

// ===== CRAFTSMEN GRID =====
let currentSpotlightIndex = 0;

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
    
    // Get artisan's products (or random ones for prototype)
    let artisanProducts = products.filter(p => p.artisan === artisan.name);
    
    // If no products found, assign random products for prototype
    if (artisanProducts.length === 0) {
        const randomProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, 3);
        artisanProducts = randomProducts;
    } else if (artisanProducts.length > 3) {
        artisanProducts = artisanProducts.slice(0, 3);
    }
    
    // Update portrait
    const portrait = document.getElementById('spotlightPortrait');
    portrait.innerHTML = `<img src="${artisan.image}" alt="${artisan.name}" onerror="this.src='face1.jpg'">`;
    
    // Update details
    const details = document.getElementById('spotlightDetails');
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
                        <img src="${product.image}" alt="${product.name}" onerror="this.src='pot1.webp'">
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
    
    // Update counter
    updateCounter();
    
    // Add fade animation
    const spotlight = document.getElementById('artisanSpotlight');
    spotlight.style.opacity = '0';
    setTimeout(() => {
        spotlight.style.opacity = '1';
    }, 50);
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
}

function prevArtisan() {
    currentSpotlightIndex = (currentSpotlightIndex - 1 + craftsmen.length) % craftsmen.length;
    displaySpotlightArtisan(currentSpotlightIndex);
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
                if (priceElement.style.display === 'none') {
                    priceElement.style.display = 'block';
                    priceElement.style.animation = 'fadeIn 0.3s ease';
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
                <div class="product-price-large" style="display: none;">¥${product.price.toLocaleString()}</div>
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
}

// Helper function to open product by ID
function openProductById(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        openProductModal(product);
    }
}

function openProductModal(product) {
    const modal = document.getElementById('productModal');
    const modalInner = document.getElementById('modalInner');
    
    modalInner.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; padding: 2rem;">
            <div>
                <img src="${product.image}" alt="${product.name}" style="width: 100%; border-radius: 8px;" onerror="this.src='pot1.webp'">
            </div>
            <div style="padding: 1rem;">
                <div style="display: inline-block; background: #000000; color: white; padding: 0.4rem 1rem; font-size: 0.7rem; margin-bottom: 1rem; border-radius: 3px;">${product.badge}</div>
                <h2 style="font-family: 'Cinzel', serif; font-size: 2.5rem; margin-bottom: 1rem; color: #000000;">${product.name}</h2>
                <p style="font-family: 'Noto Serif JP', serif; font-size: 1.1rem; color: #666; margin-bottom: 0.5rem;">By ${product.artisan}</p>
                <p style="color: #000000; font-weight: 600; margin-bottom: 2rem;">📍 ${product.location}</p>
                
                <div style="background: var(--cream); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 1rem; color: #000000;">About</h3>
                    <p style="line-height: 1.8; margin-bottom: 1rem; color: #333;">${product.description}</p>
                    <div style="display: grid; gap: 0.8rem; font-size: 0.9rem; color: #333;">
                        <div><strong>Materials:</strong> ${product.materials}</div>
                        <div><strong>Dimensions:</strong> ${product.dimensions}</div>
                    </div>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 1rem; padding-top: 1.5rem; border-top: 2px solid #ddd;">
                    <div style="font-size: 2rem; font-weight: 700; color: #000000;">¥${product.price.toLocaleString()}</div>
                    <button onclick="initiateStripeCheckout(${product.id})" style="padding: 1.2rem 2rem; background: #635BFF; color: white; border: none; font-size: 0.95rem; cursor: pointer; border-radius: 6px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                        <i class="fas fa-lock"></i> Buy Now
                    </button>
                    <button onclick="addToCart(${product.id}); closeProductModal();" style="padding: 1rem 2rem; background: #000000; color: white; border: none; font-size: 0.9rem; cursor: pointer; border-radius: 6px; font-weight: 600;">
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
    
    // Check if Stripe is available
    if (!stripe || !cardElementDiv) {
        console.warn('Stripe not available or card element not found');
        if (cardElementDiv) {
            cardElementDiv.innerHTML = `
                <div style="padding: 2rem; background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; text-align: center;">
                    <p style="margin-bottom: 1rem; font-weight: 600; color: #856404;">⚠️ Demo Mode</p>
                    <p style="color: #856404; margin-bottom: 1rem;">Stripe API key not configured. Add your key to enable real payments.</p>
                    <p style="font-size: 0.85rem; color: #856404;">Get your key from: <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" style="color: #0066cc;">Stripe Dashboard</a></p>
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
                    iconColor: '#50C878'
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
    showNotification('Search coming soon!');
}

function toggleWishlist() {
    showNotification('Wishlist coming soon!');
}

// Initialize partner section with Japanese default
function initPartnerLanguage() {
    // Set Japanese as default
    switchPartnerLanguage('jp', document.querySelector('.lang-btn[onclick*="jp"]'));
}

// Partner section language toggle
function switchPartnerLanguage(lang, clickedButton) {
    // Update button states
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    clickedButton.classList.add('active');
    
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

// ===== ASCII VIDEO EFFECT =====
// Configuration
const ASCII_CONFIG = {
    videoPath: 'wind2.mp4', // Easy to change video source
    chars: ' .░▒▓█', // Brightness-based character set - using Unicode blocks for better clarity
    resolution: 0.15, // Lower = more detail, higher = better performance (0.1 to 0.3 recommended)
    useColor: false, // Set to true for colored ASCII (uses more resources)
    frameRate: 24 // Target frame rate (24fps for cinematic look, 30fps for smooth)
};

// ASCII Video Class
class ASCIIVideoEffect {
    constructor(config, videoId, canvasId, outputId, cropConfig = null) {
        this.config = config;
        this.video = document.getElementById(videoId || 'asciiVideoSource');
        this.canvas = document.getElementById(canvasId || 'asciiCanvas');
        this.output = document.getElementById(outputId || 'asciiOutput');
        this.cropConfig = cropConfig; // { left: 0.25, bottom: 0.25 } for cropping
        
        if (!this.video || !this.canvas || !this.output) {
            console.error('ASCII Video: Required elements not found', videoId, canvasId, outputId);
            return;
        }
        
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.isRunning = false;
        
        // Frame rate control
        this.frameRate = config.frameRate || 24;
        this.frameInterval = 1000 / this.frameRate;
        this.lastFrameTime = 0;
        
        this.init();
    }
    
    init() {
        // Wait for video metadata to load
        this.video.addEventListener('loadedmetadata', () => {
            this.setupCanvas();
            this.start();
        });
        
        // Start video if it hasn't loaded yet
        if (this.video.readyState >= 2) {
            this.setupCanvas();
            this.start();
        }
        
        // Handle window resize with debounce
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.setupCanvas();
            }, 150);
        };
        
        window.addEventListener('resize', handleResize);
        
        // Use ResizeObserver for container changes
        if (typeof ResizeObserver !== 'undefined') {
            const resizeObserver = new ResizeObserver(entries => {
                handleResize();
            });
            
            // Observe both the parent and the section
            if (this.output.parentElement) {
                resizeObserver.observe(this.output.parentElement);
                if (this.output.parentElement.parentElement) {
                    resizeObserver.observe(this.output.parentElement.parentElement);
                }
            }
        }
    }
    
    setupCanvas() {
        // Set canvas size based on parent container or viewport
        const container = this.output.parentElement;
        const parentSection = container ? container.parentElement : null;
        
        // Use the section dimensions, not just the container
        const targetWidth = parentSection ? parentSection.offsetWidth : (container ? container.offsetWidth : window.innerWidth);
        const targetHeight = parentSection ? parentSection.offsetHeight : (container ? container.offsetHeight : window.innerHeight);
        
        if (this.video.videoWidth && this.video.videoHeight) {
            const videoAspectRatio = this.video.videoWidth / this.video.videoHeight;
            const containerAspectRatio = targetWidth / targetHeight;
            
            // Cover the entire area like object-fit: cover
            if (containerAspectRatio > videoAspectRatio) {
                // Container is wider than video
                this.canvas.width = Math.floor(targetWidth / 3);
                this.canvas.height = Math.floor(this.canvas.width / videoAspectRatio);
            } else {
                // Container is taller than video
                this.canvas.height = Math.floor(targetHeight / 3);
                this.canvas.width = Math.floor(this.canvas.height * videoAspectRatio);
            }
        } else {
            // Fallback if video dimensions not available yet
            this.canvas.width = Math.floor(targetWidth / 3);
            this.canvas.height = Math.floor(targetHeight / 3);
        }
    }
    
    getBrightness(r, g, b) {
        // Calculate relative luminance
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }
    
    getASCIIChar(brightness) {
        const charIndex = Math.floor(brightness * (this.config.chars.length - 1));
        return this.config.chars[charIndex];
    }
    
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
    
    convertFrameToASCII() {
        try {
            // Draw current video frame to canvas with optional cropping
            if (this.cropConfig) {
                // Calculate crop dimensions
                const videoWidth = this.video.videoWidth;
                const videoHeight = this.video.videoHeight;
                
                const cropLeft = this.cropConfig.left || 0;
                const cropBottom = this.cropConfig.bottom || 0;
                
                // Source rectangle (what part of video to use)
                const sx = videoWidth * cropLeft;
                const sy = 0;
                const sWidth = videoWidth * (1 - cropLeft);
                const sHeight = videoHeight * (1 - cropBottom);
                
                // Draw cropped video to canvas
                this.ctx.drawImage(
                    this.video,
                    sx, sy, sWidth, sHeight,  // Source rectangle
                    0, 0, this.canvas.width, this.canvas.height  // Destination rectangle
                );
            } else {
                // Draw full video frame to canvas
                this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            }
            
            // Get pixel data (may fail due to CORS)
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const pixels = imageData.data;
            
            let asciiImage = '';
            
            // Process each row
            for (let y = 0; y < this.canvas.height; y++) {
                let row = '';
                
                // Process each column
                for (let x = 0; x < this.canvas.width; x++) {
                    const offset = (y * this.canvas.width + x) * 4;
                    const r = pixels[offset];
                    const g = pixels[offset + 1];
                    const b = pixels[offset + 2];
                    
                    const brightness = this.getBrightness(r, g, b);
                    const char = this.getASCIIChar(brightness);
                    
                    row += char;
                }
                
                asciiImage += row + '\n';
            }
            
            // Update output as plain text
            this.output.textContent = asciiImage;
        } catch (error) {
            // CORS error - show fallback pattern
            if (!this.corsErrorShown) {
                console.warn('ASCII Video CORS error - using fallback pattern. Serve via HTTP server for full effect.');
                this.corsErrorShown = true;
                this.showFallbackPattern();
            }
        }
    }
    
    showFallbackPattern() {
        // Create a beautiful static ASCII pattern as fallback
        let pattern = '';
        const chars = this.config.chars;
        for (let y = 0; y < 80; y++) {
            for (let x = 0; x < 200; x++) {
                const wave = Math.sin(x * 0.1 + y * 0.1) * 0.5 + 0.5;
                const charIndex = Math.floor(wave * (chars.length - 1));
                pattern += chars[charIndex];
            }
            pattern += '\n';
        }
        this.output.textContent = pattern;
    }
    
    render(currentTime) {
        if (!this.isRunning) return;
        
        // Frame rate limiting
        const elapsed = currentTime - this.lastFrameTime;
        
        if (elapsed >= this.frameInterval) {
            // Update frame
            this.lastFrameTime = currentTime - (elapsed % this.frameInterval);
            
            // Check if container is visible and has reasonable dimensions
            const container = this.output.parentElement;
            if (container) {
                const rect = container.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    this.convertFrameToASCII();
                }
            } else {
                this.convertFrameToASCII();
            }
        }
        
        requestAnimationFrame((time) => this.render(time));
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        
        this.video.play().catch(err => {
            console.warn('ASCII Video autoplay prevented:', err);
            // Try again on user interaction
            document.addEventListener('click', () => {
                if (!this.isRunning) return;
                this.video.play().catch(e => console.error('Failed to play video:', e));
            }, { once: true });
        });
        
        requestAnimationFrame((time) => this.render(time));
    }
    
    stop() {
        this.isRunning = false;
        this.video.pause();
    }
}

// Initialize Partner ASCII Background
function initPartnerASCII() {
    // Small delay to ensure DOM is fully ready
    setTimeout(() => {
        const video = document.getElementById('asciiVideoSourcePartner');
        const canvas = document.getElementById('asciiCanvasPartner');
        const output = document.getElementById('asciiOutputPartner');
        
        if (video && canvas && output) {
            new ASCIIVideoEffect(ASCII_CONFIG, 'asciiVideoSourcePartner', 'asciiCanvasPartner', 'asciiOutputPartner');
            console.log('ASCII Partner background initialized');
        } else {
            console.error('ASCII Partner elements not found:', { video: !!video, canvas: !!canvas, output: !!output });
        }
    }, 500);
}

// Initialize Hero ASCII Effect
function initHeroASCII() {
    // Small delay to ensure DOM is fully ready
    setTimeout(() => {
        const video = document.getElementById('asciiVideoSourceHero');
        const canvas = document.getElementById('asciiCanvasHero');
        const output = document.getElementById('asciiOutputHero');
        
        if (video && canvas && output) {
            // Crop left 25% and bottom 25% for homepage hero
            const cropConfig = { left: 0.095, bottom: 0.22 };
            new ASCIIVideoEffect(ASCII_CONFIG, 'asciiVideoSourceHero', 'asciiCanvasHero', 'asciiOutputHero', cropConfig);
            console.log('ASCII Hero video initialized with cropping (left 9.5%, bottom 22%)');
        } else {
            console.error('ASCII Hero elements not found:', { video: !!video, canvas: !!canvas, output: !!output });
        }
    }, 500);
}

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
        
        // Disable ASCII effects on mobile for performance
        if (isIOS) {
            const asciiElements = document.querySelectorAll('.ascii-output, .ascii-hero-output');
            asciiElements.forEach(el => {
                el.style.display = 'none';
            });
        }
        
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
