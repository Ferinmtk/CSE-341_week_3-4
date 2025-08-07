const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport'); // Keep passport require for initialization
const path = require('path');
require('dotenv').config();

console.log('[ENV CHECK]', {
  CLIENT_ID: !!process.env.CLIENT_ID,
  CLIENT_SECRET: !!process.env.CLIENT_SECRET,
  CALLBACK_URL: process.env.CALLBACK_URL
});


const setupSwagger = require('./swagger'); // Import Swagger setup
const authRoutes = require('./routes/auth'); // Import auth routes
const { ensureAuthenticated } = require('./middleware/auth'); // Import middleware

const app = express(); // Ensure app initialization is here

// Enable trusting proxy headers - Important for environments like Render
app.set('trust proxy', 1); // Trust first proxy

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Session configuration using connect-mongo
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false, // Recommended: don't save session if unmodified
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions' // Optional: specify collection name
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Set secure based on environment
    maxAge: 1000 * 60 * 60 * 24 // Optional: Set cookie expiry (e.g., 1 day)
  }
}));

// Initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization/deserialization (keep this here as it's global)
passport.serializeUser((user, done) => {
  // In a real app, you might serialize just the user ID
  console.log('[DEBUG] Serializing user:', JSON.stringify(user, null, 2)); // Added logging
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  // In a real app, you might fetch the user from the database based on the ID
  console.log('[DEBUG] Deserializing user:', JSON.stringify(obj, null, 2)); // Added logging
  done(null, obj);
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Basic route for the homepage
app.get('/', (req, res) => {
  // Serve the main page
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Setup Swagger Documentation
setupSwagger(app);

// API Routes
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/ingredients', require('./routes/ingredients'));

// Authentication Routes
app.use('/auth', authRoutes); // Mount the authentication routes

// --- API Endpoint to get current user ---
app.get('/api/user/me', ensureAuthenticated, (req, res) => {
  // Passport attaches the user profile to req.user after successful login
  if (req.user) {
    console.log('User object:', JSON.stringify(req.user, null, 2)); // Log the user object
    res.json({
      // Prioritize GitHub username, fallback to displayName if username is missing
      username: req.user.username || req.user.displayName 
    });
  } else {
    // This case should ideally not be hit if ensureAuthenticated works,
    // but included for robustness.
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// --- Protected Route Example (using imported middleware) ---
// This route serves the recipes page only if the user is authenticated
app.get('/recipes', ensureAuthenticated, (req, res) => {
  // Ensure the path is correct relative to the server.js file location
  res.sendFile(path.join(__dirname, 'public', 'recipes.html'));
});

// 404 handler - Should be after all other routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware - Should be the last middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Swagger setup message is now handled within swagger.js
});
