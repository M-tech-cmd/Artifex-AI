// api/index.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Import your routes and controllers from the 'server' folder
const userRoutes = require('../server/routes/userRoutes');
const imageRoutes = require('../server/routes/imageRoutes');
// ... import other routes as needed

dotenv.config(); // Load environment variables

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL, // Use CLIENT_URL from Vercel env vars
    credentials: true,
}));
app.use(express.json()); // For parsing JSON request bodies

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define your API routes
app.use('/api/users', userRoutes); // Example: /api/users
app.use('/api/images', imageRoutes); // Example: /api/images
// ... use other routes

// Basic route for the serverless function itself (optional)
app.get('/api', (req, res) => {
    res.send('Artifex AI Backend API is running!');
});

// Error handling middleware (optional, but good practice)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// For Vercel, you export the app
module.exports = app;

// For local development, you might listen on a port
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));