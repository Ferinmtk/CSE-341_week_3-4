const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
require('dotenv').config(); // Ensure environment variables are loaded

const router = express.Router();

// --- Passport Configuration ---

// Debug: Check environment variable presence
console.log('[ENV CHECK]', {
  GITHUB_CLIENT_ID: !!process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: !!process.env.GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL
});

// Validate required GitHub OAuth variables
if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET || !process.env.GITHUB_CALLBACK_URL) {
  console.error("Error: Missing required GitHub OAuth environment variables (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL).");
} else {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
  }, (accessToken, refreshToken, profile, done) => {
    console.log('[DEBUG] GitHub Strategy Callback: Profile received:', JSON.stringify(profile, null, 2));
    return done(null, profile);
  }));
}

// --- Authentication Routes ---

router.get('/github', passport.authenticate('github', { prompt: 'consent' }));

router.get('/github/callback', passport.authenticate('github', {
  failureRedirect: '/',
  successRedirect: '/'
}), (req, res) => {
  console.log('GitHub auth callback successful, redirecting via successRedirect.');
});

router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) {
      console.error("Logout error:", err);
      return next(err);
    }
    console.log('User logged out, redirecting home.');
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error("Session destruction error:", destroyErr);
      }
      res.redirect('/');
    });
  });
});

router.get('/api/auth/status', (req, res) => {
  console.log('[DEBUG] /api/auth/status: Request received.');
  console.log('[DEBUG] /api/auth/status: req.isAuthenticated() ->', req.isAuthenticated());
  console.log('[DEBUG] /api/auth/status: req.sessionID ->', req.sessionID);
  console.log('[DEBUG] /api/auth/status: req.session.passport ->', JSON.stringify(req.session.passport, null, 2));
  console.log('[DEBUG] /api/auth/status: req.user ->', JSON.stringify(req.user, null, 2));

  if (req.isAuthenticated()) {
    res.json({
      loggedIn: true,
      user: {
        username: req.user.username,
        displayName: req.user.displayName
      }
    });
  } else {
    res.status(401).json({ loggedIn: false });
  }
});

module.exports = router;
