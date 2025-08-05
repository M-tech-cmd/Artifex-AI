// client/src/components/PaymentComponent.jsx (or similar)
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js'; // Import loadStripe

const PaymentComponent = () => {
    const handleCheckout = async () => {
        try {
            // 1. Call YOUR BACKEND to create the checkout session
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/create-checkout-session`, {
                // You might send product details, quantity, user ID, etc.
                amount: 2000, // Example: 20 USD
                currency: 'usd',
                productName: 'Artifex AI Credits'
            });

            const { url } = response.data; // Your backend should return the Stripe Session URL

            if (url) {
                // 2. Redirect the user to Stripe Checkout
                window.location.href = url;
            } else {
                console.error('Backend did not return a Stripe checkout URL.');
            }

        } catch (error) {
            console.error('Error during checkout process:', error.response ? error.response.data : error.message);
            // Display a user-friendly error message
            alert('Payment failed. Please try again later.'); // Use a custom modal instead of alert in production
        }
    };

    return (
        <button onClick={handleCheckout}>Proceed to Payment</button>
    );
};

export default PaymentComponent;