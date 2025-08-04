import userModel from "../models/userModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Stripe from 'stripe';
import transactionModel from "../models/transactionModel.js";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()

        const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET)

        res.json({ success: true, token, user: { name: user.name } })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: 'User does not exist' })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

            res.json({ success: true, token, user: { name: user.name }})

        } else {
            return res.json({ success: false, message: 'Invalid credentials' })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const userCredits = async (req, res) => {
    try {
        const { userId } = req.body

        const user = await userModel.findById(userId)
        res.json({ success: true, credits: user.creditBalance, user: { name: user.name } })
    }
    catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Stripe Checkout Session Creation
const stripeCheckout = async (req, res) => {
    try {
        const { userId, planId } = req.body;

        const userData = await userModel.findById(userId);
        if (!userData || !planId) {
            return res.json({ success: false, message: 'Missing Details' });
        }

        let credits, plan, amount;
        switch (planId) {
            case 'Basic':
                credits = 100;
                plan = 'Basic';
                amount = 10;
                break;
            case 'Advanced':
                credits = 500;
                plan = 'Advanced';
                amount = 50;
                break;
            case 'Business':
                credits = 250;
                plan = 'Business';
                amount = 250;
                break;
            default:
                return res.json({ success: false, message: 'Plan not found' });
        }

        const date = new Date();
        
        // Create transaction record first
        const transactionData = {
            userId, 
            plan, 
            amount, 
            credits, 
            date,
            status: 'pending' // Add status to track payment
        };

        const newTransaction = await transactionModel.create(transactionData);

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `${plan} Plan - Artifex AI`,
                            description: `${credits} AI credits for image generation`,
                        },
                        unit_amount: amount * 100, // Stripe expects amount in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/buy-credit?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/buy-credit?canceled=true`,
            client_reference_id: userId,
            metadata: {
                transactionId: newTransaction._id.toString(),
                userId: userId,
                plan: plan,
                credits: credits.toString()
            }
        });

        res.json({ 
            success: true, 
            sessionId: session.id,
            url: session.url 
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Verify Stripe Payment
const verifyStripePayment = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const { userId } = req.body;

        if (!sessionId) {
            return res.json({ success: false, message: 'Session ID required' });
        }

        // Retrieve the checkout session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const transactionId = session.metadata.transactionId;
            const credits = parseInt(session.metadata.credits);
            const userIdFromSession = session.metadata.userId;

            // Update transaction status
            await transactionModel.findByIdAndUpdate(transactionId, {
                status: 'completed',
                stripeSessionId: sessionId
            });

            // Update user's credit balance
            await userModel.findByIdAndUpdate(userIdFromSession, {
                $inc: { creditBalance: credits }
            });

            res.json({ 
                success: true, 
                message: 'Payment verified and credits added successfully' 
            });
        } else {
            res.json({ 
                success: false, 
                message: 'Payment not completed' 
            });
        }

    } catch (error) {
        console.log('Stripe verification error:', error);
        res.json({ success: false, message: error.message });
    }
}

// Optional: Stripe Webhook Handler (recommended for production)
const stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log('Webhook signature verification failed.', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        const transactionId = session.metadata.transactionId;
        const credits = parseInt(session.metadata.credits);
        const userId = session.metadata.userId;

        try {
            // Update transaction status
            await transactionModel.findByIdAndUpdate(transactionId, {
                status: 'completed',
                stripeSessionId: session.id
            });

            // Update user's credit balance
            await userModel.findByIdAndUpdate(userId, {
                $inc: { creditBalance: credits }
            });

            console.log('Credits added successfully via webhook');
        } catch (error) {
            console.log('Webhook processing error:', error);
        }
    }

    res.json({ received: true });
}

export { 
    registerUser, 
    loginUser, 
    userCredits, 
    stripeCheckout, 
    verifyStripePayment,
    stripeWebhook 
};