const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
require('dotenv').config(); // Ensure environment variables are loaded

const router = express.Router();

// --- Passport Configuration ---

// Verify GitHub environment variables are loaded (optional, for debugging)
// console.log('GITHUB_CLIENT_ID (in auth.js):', process.env.GITHUB_CLIENT_ID); 
// console.log('GITHUB_CLIENT_SECRET (in auth.js):', process.env.GITHUB_CLIENT_SECRET ? 'Loaded' : 'MISSING');
// console.log('GITHUB_CALLBACK_URL (in auth.js):', process.env.GITHUB_CALLBACK_URL);

// Check if required variables are present
if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET || !process.env.GITHUB_CALLBACK_URL) {
  console.error("Error: Missing required GitHub OAuth environment variables (CLIENT_ID, CLIENT_SECRET, CALLBACK_URL).");
  // Optionally, throw an error or exit if these are critical for startup
  // throw new Error("Missing GitHub OAuth environment variables."); 
} else {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
  }, (accessToken, refreshToken, profile, done) => {
    // In a real app, you would find or create a user in your database here
    // For this example, we just pass the GitHub profile directly
    console.log('[DEBUG] GitHub Strategy Callback: Profile received:', JSON.stringify(profile, null, 2)); // Added logging
    return done(null, profile); 
  }));
}

// --- Authentication Routes ---

/**
 * @swagger
 * /auth/github:
 *   get:
 *     summary: Initiate GitHub OAuth login
 *     tags: [Authentication]
 *     description: Redirects the user to GitHub for authentication. Upon successful authentication, GitHub redirects back to the callback URL.
 *     responses:
 *       302:
 *         description: Redirecting to GitHub for authentication.
 */
router.get('/github', passport.authenticate('github', { prompt: 'consent' })); // Corrected path (removed /auth prefix)

/**
 * @swagger
 * /auth/github/callback:
 *   get:
 *     summary: GitHub OAuth callback URL
 *     tags: [Authentication]
 *     description: GitHub redirects the user here after successful authentication. The server handles the callback, establishes a session, and redirects the user.
 *     responses:
 *       302:
 *         description: Successfully authenticated, redirecting to the home page ('/'). Sets the session cookie.
 *       401:
 *         description: Authentication failed. Redirects to the home page ('/').
 */
router.get('/github/callback', passport.authenticate('github', { // Corrected path
  failureRedirect: '/', // Redirect back to home on failure
  successRedirect: '/'  // Redirect back to home on success (session is established)
}), (req, res) => {
  // This callback is only hit on success *after* passport.authenticate handles the redirect.
  // You could add logging here if needed, but the redirect is handled above.
  console.log('GitHub auth callback successful, redirecting via successRedirect.'); 
});

/**
 * @swagger
 * /logout:
 *   get:
 *     summary: Log out the current user
 *     tags: [Authentication]
 *     description: Destroys the current user session and redirects to the home page.
 *     responses:
 *       302:
 *         description: Successfully logged out, redirecting to the home page ('/'). Clears the session cookie.
 */
router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { 
      console.error("Logout error:", err); // Log the error
      return next(err); 
    }
    console.log('User logged out, redirecting home.');
    // Ensure session is destroyed before redirecting
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error("Session destruction error:", destroyErr);
        // Decide how to handle session destruction errors, maybe still redirect
      }
      res.redirect('/');
    });
  });
});

/**
 * @swagger
 * /api/auth/status:
 *   get:
 *     summary: Check user authentication status
 *     tags: [Authentication]
 *     description: Returns the logged-in user's information (if authenticated) or an indication that the user is not logged in.
 *     responses:
 *       200:
 *         description: Authentication status retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 loggedIn:
 *                   type: boolean
 *                   description: Indicates if a user is currently logged in.
 *                 user:
 *                   type: object
 *                   description: User profile information (present only if loggedIn is true).
 *                   properties:
 *                     username:
 *                       type: string
 *                       description: The user's GitHub username.
 *                     displayName:
 *                       type: string
 *                       description: The user's display name from GitHub.
 *                     # Add other relevant profile fields if needed
 *               example:
 *                 loggedIn: true
 *                 user: { username: "octocat", displayName: "The Octocat" }
 *       401:
 *         description: User is not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 loggedIn:
 *                   type: boolean
 *                   example: false
 */
router.get('/api/auth/status', (req, res) => {
  console.log('[DEBUG] /api/auth/status: Request received.');
  console.log('[DEBUG] /api/auth/status: req.isAuthenticated() ->', req.isAuthenticated());
  // Avoid logging the entire session if it contains sensitive data or is very large
  // Log specific parts or just confirmation
  console.log('[DEBUG] /api/auth/status: req.sessionID ->', req.sessionID); 
  console.log('[DEBUG] /api/auth/status: req.session.passport ->', JSON.stringify(req.session.passport, null, 2)); 
  console.log('[DEBUG] /api/auth/status: req.user ->', JSON.stringify(req.user, null, 2)); 

  if (req.isAuthenticated()) {
    // User is logged in, send back relevant user info
    console.log('[DEBUG] /api/auth/status: User IS authenticated. Sending user data.');
    res.json({
      loggedIn: true,
      user: {
        username: req.user.username, // Assuming passport stores profile here
        displayName: req.user.displayName,
        // Add other fields from req.user if needed
      }
    });
  } else {
    // User is not logged in
    res.status(401).json({ loggedIn: false });
  }
});


module.exports = router;
