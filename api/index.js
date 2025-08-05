// api/index.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const stripe = require('stripe'); // Make sure you have this imported for webhook verification

// Import your routes and controllers from the 'server' folder
const userRoutes = require('../server/routes/userRoutes');
const imageRoutes = require('../server/routes/imageRoutes');
// ... import other routes as needed

dotenv.config();

const app = express();

// Initialize Stripe with your secret key
const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

// --- IMPORTANT: Webhook specific middleware ---
// This middleware MUST come BEFORE express.json() for the webhook route
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('Checkout Session Completed:', session);
            // Implement your logic here: update user credits, mark payment as successful, etc.
            break;
        // ... handle other event types you selected in Stripe
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
});

// --- General middleware (comes AFTER the specific webhook raw body parser) ---
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
app.use(express.json()); // For parsing JSON request bodies for all OTHER routes


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define your API routes (ensure these paths match what your frontend calls)
app.use('/api/users', userRoutes);
app.use('/api/images', imageRoutes);
// ... use other routes

app.get('/api', (req, res) => {
    res.send('Artifex AI Backend API is running!');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

module.exports = app;