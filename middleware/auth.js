// Middleware to check if user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { 
    return next(); 
  }
  // Redirect to home page or send an error if not authenticated
  // Depending on whether it's an API request or browser navigation
  if (req.accepts('html')) {
    // Consider redirecting to a dedicated login prompt page if you have one
    res.redirect('/'); 
  } else {
    // For API requests, send an Unauthorized status
    res.status(401).json({ message: 'Unauthorized: Access requires login.' });
  }
}

module.exports = { ensureAuthenticated };
