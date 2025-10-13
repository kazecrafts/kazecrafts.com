// Backend Example for Kaze Crafts Marketplace
// This is a Node.js/Express example for Stripe integration

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

// Calculate order total
function calculateOrderAmount(items) {
    // Replace with your actual price calculation
    return items.reduce((total, item) => total + item.price, 0);
}

// Create Payment Intent endpoint
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { items, shipping, customerInfo } = req.body;
        
        // Calculate total
        const subtotal = calculateOrderAmount(items);
        const shippingCost = 2500; // ¥2,500 flat rate
        const total = subtotal + shippingCost;
        
        // Create Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: total,
            currency: 'jpy',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                customer_name: customerInfo.name,
                customer_email: customerInfo.email,
                order_items: JSON.stringify(items.map(item => ({
                    id: item.id,
                    name: item.name,
                    artisan: item.artisan,
                    price: item.price
                })))
            },
            description: `Kaze Crafts Order - ${items.length} items`,
            receipt_email: customerInfo.email,
        });
        
        res.send({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
        
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).send({ error: error.message });
    }
});

// Webhook endpoint for Stripe events
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('Payment succeeded:', paymentIntent.id);
            
            // TODO: 
            // 1. Create order in database
            // 2. Send confirmation email to customer
            // 3. Notify artisans
            // 4. Update inventory
            await handleSuccessfulPayment(paymentIntent);
            break;
            
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('Payment failed:', failedPayment.id);
            
            // TODO: Send failure notification
            await handleFailedPayment(failedPayment);
            break;
            
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    
    res.json({received: true});
});

// Handle successful payment
async function handleSuccessfulPayment(paymentIntent) {
    const { metadata } = paymentIntent;
    const orderItems = JSON.parse(metadata.order_items);
    
    // Example: Save to database
    const order = {
        id: paymentIntent.id,
        customerName: metadata.customer_name,
        customerEmail: metadata.customer_email,
        items: orderItems,
        total: paymentIntent.amount,
        status: 'paid',
        createdAt: new Date()
    };
    
    console.log('Creating order:', order);
    
    // TODO: 
    // - Save to your database
    // - Send confirmation email
    // - Create shipping labels
    // - Notify artisans with order details
    
    // Example email content
    const emailContent = {
        to: metadata.customer_email,
        subject: 'Order Confirmed - Kaze Crafts',
        body: `
            Dear ${metadata.customer_name},
            
            Thank you for your order! Your authentic Japanese crafts are being prepared.
            
            Order ID: ${paymentIntent.id}
            Total: ¥${paymentIntent.amount.toLocaleString()}
            
            Items:
            ${orderItems.map(item => `- ${item.name} by ${item.artisan}`).join('\n')}
            
            You'll receive tracking information once your items ship.
            
            風 Kaze Crafts
        `
    };
    
    // Send email (use SendGrid, AWS SES, etc.)
    // await sendEmail(emailContent);
}

// Handle failed payment
async function handleFailedPayment(paymentIntent) {
    console.log('Payment failed for:', paymentIntent.id);
    
    // TODO: Send failure notification to customer
    // Offer to retry or contact support
}

// Get product details endpoint
app.get('/products', async (req, res) => {
    // TODO: Return products from database
    // For now, can return the same products from app.js
    res.json({ products: [] });
});

// Get specific product
app.get('/products/:id', async (req, res) => {
    const { id } = req.params;
    // TODO: Fetch from database
    res.json({ product: {} });
});

// Create order endpoint (for record-keeping before payment)
app.post('/orders', async (req, res) => {
    try {
        const { items, customerInfo, shippingAddress } = req.body;
        
        // Create pending order
        const order = {
            status: 'pending',
            items,
            customerInfo,
            shippingAddress,
            createdAt: new Date()
        };
        
        // TODO: Save to database
        
        res.json({ orderId: 'ORDER_ID' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Artisan payout endpoint (using Stripe Connect)
app.post('/payouts/artisan', async (req, res) => {
    try {
        const { artisanId, amount, orderId } = req.body;
        
        // TODO: Implement Stripe Connect for artisan payouts
        // This allows you to split payments and pay artisans directly
        
        const transfer = await stripe.transfers.create({
            amount: amount,
            currency: 'jpy',
            destination: artisanId, // Artisan's Stripe Connect account ID
            metadata: {
                order_id: orderId
            }
        });
        
        res.json({ transfer });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Kaze Crafts backend running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Export for testing
module.exports = app;

/*
SETUP INSTRUCTIONS:

1. Install dependencies:
   npm install express stripe cors dotenv

2. Create .env file:
   STRIPE_SECRET_KEY=sk_test_your_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   PORT=3000
   NODE_ENV=development

3. Run server:
   node backend-example.js

4. Update app.js to use this backend:

   // In handleCheckoutSubmit function
   const response = await fetch('http://localhost:3000/create-payment-intent', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
           items: cart,
           shipping: { method: 'standard' },
           customerInfo: {
               name: fullName,
               email: email
           }
       })
   });
   
   const { clientSecret } = await response.json();
   
   const result = await stripe.confirmCardPayment(clientSecret, {
       payment_method: {
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
       }
   });

5. Set up Stripe webhooks:
   - Go to Stripe Dashboard > Developers > Webhooks
   - Add endpoint: http://your-domain.com/webhook
   - Select events: payment_intent.succeeded, payment_intent.payment_failed
   - Copy webhook secret to .env

6. For production:
   - Use real Stripe keys (not test keys)
   - Deploy to server (Heroku, AWS, DigitalOcean, etc.)
   - Use proper database (PostgreSQL, MongoDB, etc.)
   - Implement authentication
   - Add rate limiting
   - Use HTTPS
   - Set up error monitoring (Sentry, etc.)

STRIPE CONNECT FOR MULTI-VENDOR:

For splitting payments between your platform and artisans:

1. Set up Stripe Connect:
   - Dashboard > Connect > Get Started
   - Choose "Platform or marketplace"

2. Onboard artisans:
   - They connect their Stripe accounts
   - You get their account ID

3. Create charges with application fees:
   
   const paymentIntent = await stripe.paymentIntents.create({
       amount: 85000,
       currency: 'jpy',
       application_fee_amount: 8500, // 10% platform fee
       transfer_data: {
           destination: artisanStripeAccountId
       }
   });

This way, artisans get paid directly (minus your fee).
*/

