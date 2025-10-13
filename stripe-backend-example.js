// ===== STRIPE BACKEND API EXAMPLE =====
// This is a Node.js/Express example for handling Stripe payments
// Deploy this to your backend server

const express = require('express');
const stripe = require('stripe')('sk_test_YOUR_SECRET_KEY_HERE'); // Replace with your secret key
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: 'https://kazecrafts.com', // Replace with your frontend URL
    credentials: true
}));

// ===== CREATE PAYMENT INTENT =====
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { amount, payment_method, metadata } = req.body;
        
        // Validate amount (JPY has no decimals)
        if (!amount || amount < 50) {
            return res.status(400).json({ 
                error: 'Invalid amount. Minimum ¥50 required.' 
            });
        }
        
        // Create Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // Amount in JPY (no decimals)
            currency: 'jpy',
            payment_method: payment_method,
            confirm: true,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never'
            },
            metadata: {
                customer_name: metadata.customerName,
                customer_email: metadata.customerEmail,
                order_id: 'order_' + Date.now(),
                items: JSON.stringify(metadata.items)
            },
            receipt_email: metadata.customerEmail,
            description: 'Kaze Crafts Purchase',
            shipping: {
                name: metadata.customerName,
                address: {
                    line1: metadata.shipping.address,
                    city: metadata.shipping.city,
                    postal_code: metadata.shipping.postalCode,
                    country: metadata.shipping.country
                }
            }
        });
        
        console.log('✅ Payment Intent created:', paymentIntent.id);
        
        res.json({
            success: true,
            paymentIntentId: paymentIntent.id,
            clientSecret: paymentIntent.client_secret,
            status: paymentIntent.status,
            requiresAction: paymentIntent.status === 'requires_action'
        });
        
    } catch (error) {
        console.error('Payment Intent error:', error);
        res.status(500).json({ 
            error: error.message 
        });
    }
});

// ===== WEBHOOK HANDLER (for production) =====
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = 'whsec_YOUR_WEBHOOK_SECRET'; // Get from Stripe Dashboard
    
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('⚠️ Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('✅ Payment succeeded:', paymentIntent.id);
            // TODO: Fulfill the order, send confirmation email, etc.
            break;
            
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.error('❌ Payment failed:', failedPayment.id);
            // TODO: Handle failed payment
            break;
            
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }
    
    res.json({received: true});
});

// ===== REFUND ENDPOINT =====
app.post('/api/refund', async (req, res) => {
    try {
        const { payment_intent_id, amount, reason } = req.body;
        
        const refund = await stripe.refunds.create({
            payment_intent: payment_intent_id,
            amount: amount, // Optional: partial refund
            reason: reason || 'requested_by_customer'
        });
        
        console.log('✅ Refund created:', refund.id);
        
        res.json({
            success: true,
            refundId: refund.id,
            status: refund.status
        });
        
    } catch (error) {
        console.error('Refund error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== GET PAYMENT STATUS =====
app.get('/api/payment-status/:paymentIntentId', async (req, res) => {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(
            req.params.paymentIntentId
        );
        
        res.json({
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            created: paymentIntent.created
        });
        
    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Stripe backend running on port ${PORT}`);
    console.log('📝 Remember to:');
    console.log('   1. Replace sk_test_... with your actual secret key');
    console.log('   2. Set up webhook endpoint in Stripe Dashboard');
    console.log('   3. Update CORS origin to your frontend URL');
    console.log('   4. Enable HTTPS before production');
});

// ===== PACKAGE.JSON DEPENDENCIES =====
/*
{
  "name": "kaze-crafts-backend",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2",
    "stripe": "^13.0.0",
    "cors": "^2.8.5"
  }
}
*/

// ===== DEPLOYMENT NOTES =====
/*
1. Install dependencies:
   npm install express stripe cors

2. Set environment variables:
   export STRIPE_SECRET_KEY=sk_test_...
   export STRIPE_WEBHOOK_SECRET=whsec_...

3. Run locally:
   node stripe-backend-example.js

4. For production, deploy to:
   - Heroku
   - AWS Lambda
   - Google Cloud Functions
   - Vercel (serverless)
   - Your own VPS

5. Configure Stripe webhook:
   - Go to: https://dashboard.stripe.com/webhooks
   - Add endpoint: https://yourdomain.com/webhook
   - Select events: payment_intent.succeeded, payment_intent.payment_failed
   - Copy webhook secret to your environment variables
*/

