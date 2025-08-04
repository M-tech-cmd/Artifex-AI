import express from 'express'
import { registerUser, loginUser, userCredits, stripeCheckout, verifyStripePayment, stripeWebhook } from '../controllers/userController.js'
import userAuth from '../middlewares/auth.js'

const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/credits', userAuth, userCredits)
userRouter.post('/stripe-checkout', userAuth, stripeCheckout)
userRouter.post('/verify-stripe-payment', userAuth, verifyStripePayment)

// Optional: Webhook endpoint for Stripe (doesn't need auth middleware)
userRouter.post('/stripe-webhook', stripeWebhook)

export default userRouter;

// Updated endpoints:
// localhost:4000/api/user/register
// localhost:4000/api/user/login  
// localhost:4000/api/user/credits
// localhost:4000/api/user/stripe-checkout
// localhost:4000/api/user/verify-stripe-payment
// localhost:4000/api/user/stripe-webhook