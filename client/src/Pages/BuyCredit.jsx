import React, { useContext } from 'react'
import { assets, plans } from "../assets/assets"
import { AppContext } from "../context/AppContext"
import { motion } from "framer-motion" // Fixed: changed from "motion/react" to "framer-motion"
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe - you'll need to add VITE_STRIPE_PUBLISHABLE_KEY to your client.env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const BuyCredit = () => {
  const { user, backendUrl, loadCreditData, token, setShowLogin } = useContext(AppContext)
  const navigate = useNavigate()

  const stripePayment = async (planId) => {
    try {
      if (!user) {
        setShowLogin(true);
        return;
      }

      console.log('Making Stripe payment request for plan:', planId);

      // Create checkout session
      const { data } = await axios.post(
        `${backendUrl}/api/user/stripe-checkout`,
        { planId },
        {
          headers: {
            token,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Stripe checkout response:', data);

      if (data.success && data.sessionId) {
        // Store success callback for when user returns from Stripe
        localStorage.setItem('pendingCreditUpdate', 'true');
        
        // Redirect to Stripe Checkout
        const stripe = await stripePromise;
        const { error } = await stripe.redirectToCheckout({
          sessionId: data.sessionId
        });

        if (error) {
          console.error('Stripe redirect error:', error);
          toast.error(error.message || "Failed to redirect to payment");
          localStorage.removeItem('pendingCreditUpdate');
        }
      } else {
        toast.error(data.message || "Failed to create checkout session");
      }
    } catch (error) {
      console.error('Stripe payment request error:', error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Check for successful payment when component mounts
  React.useEffect(() => {
    const checkPaymentSuccess = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');
      const pendingUpdate = localStorage.getItem('pendingCreditUpdate');
      
      if (sessionId && pendingUpdate) {
        try {
          // Verify the payment with your backend
          const { data } = await axios.post(
            `${backendUrl}/api/user/verify-stripe-payment`,
            { sessionId },
            { headers: { token } }
          );

          if (data.success) {
            toast.success("Payment successful!");
            loadCreditData(); // This refreshes the user's credit balance
            localStorage.removeItem('pendingCreditUpdate');
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            toast.error(data.message || "Payment verification failed");
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          toast.error(error.response?.data?.message || "Payment verification failed");
        }
      }
    };

    if (user && token) {
      checkPaymentSuccess();
    }
  }, [user, token, backendUrl, loadCreditData]);

  return (
    <motion.div
      initial={{ opacity: 0.2, y: 100 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="min-h-[80vh] text-center pt-14 mb-10">
      <button className="border border-gray-400 px-10 py-2 rounded-full mb-6">Our Plans</button>
      <h1 className="text-center text-3xl font-medium mb-6 sm:mb-10">Choose the plan</h1>

      <div className="flex flex-wrap justify-center gap-6 text-left">
        {plans.map((item, index) => (
          <div key={index}
            className="bg-white drop-shadow-sm border rounded-lg py-12 px-8 text-gray-600
                hover:scale-105 transition-all duration-500">
            <img width={40} src={assets.logo_icon} alt="" />
            <p className="mt-3 mb-1 font-semibold">{item.id}</p>
            <p className="text-sm">{item.desc}</p>
            <p className="mt-6">
              <span className="text-3xl font-medium">${item.price} </span>/ {item.credits} credits
            </p>
            <button
              onClick={() => stripePayment(item.id)}
              className="w-full bg-gray-800 text-white mt-8 text-sm rounded-md py-2.5 min-w-52"
            >
              {user ? 'Purchase' : 'Get Started'}
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default BuyCredit;