const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const path = require('path');
require('dotenv').config();

console.log('[ENV CHECK]', {
  GITHUB_CLIENT_ID: !!process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: !!process.env.GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL
});

const setupSwagger = require('./swagger');
const authRoutes = require('./routes/auth');
const { ensureAuthenticated } = require('./middleware/auth');

const app = express();

// --- Passport GitHub Strategy ---
const GitHubStrategy = require('passport-github2').Strategy;

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
  console.log('[DEBUG] GitHub Strategy Callback: Profile received:', JSON.stringify(profile, null, 2));
  return done(null, profile);
}));

// --- Express Middleware ---
app.set('trust proxy', 1); // Trust first proxy (important for Render)

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// --- Passport Serialization ---
passport.serializeUser((user, done) => {
  console.log('[DEBUG] Serializing user:', JSON.stringify(user, null, 2));
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  console.log('[DEBUG] Deserializing user:', JSON.stringify(obj, null, 2));
  done(null, obj);
});

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// --- Routes ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

setupSwagger(app);

app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/ingredients', require('./routes/ingredients'));
app.use('/auth', authRoutes);

app.get('/api/user/me', ensureAuthenticated, (req, res) => {
  if (req.user) {
    console.log('User object:', JSON.stringify(req.user, null, 2));
    res.json({
      username: req.user.username || req.user.displayName
    });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

app.get('/recipes', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'recipes.html'));
});

// --- Error Handling ---
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
