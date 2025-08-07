const passport = require('passport');

// GitHub OAuth authentication
const githubAuth = passport.authenticate('github', { scope: ['user:email'] });

// GitHub OAuth callback
const githubAuthCallback = passport.authenticate('github', { failureRedirect: '/login' },
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);

// Logout
const logout = function (req, res) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
};

module.exports = {
  githubAuth,
  githubAuthCallback,
  logout,
};
