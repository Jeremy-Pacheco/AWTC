const bcrypt = require('bcrypt');
const { User } = require('../models');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Render login page
exports.showLogin = (req, res) => {
  // If already logged in redirect to dashboard
  if (req.user) return res.redirect('/');
  res.render('login', { error: null, email: '', frontendUrl: FRONTEND_URL });
};

// Handle login POST (email + password)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.render('login', { error: 'Email and password are required', email: email || '' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.render('login', { error: 'Invalid credentials', email, frontendUrl: FRONTEND_URL });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('login', { error: 'Invalid credentials', email, frontendUrl: FRONTEND_URL });
    }

    // Save user id in session cookie (server-side session)
    req.session.userId = user.id;
    req.session.userRole = user.role;

    // Redirect to dashboard (home)
    return res.redirect('/');
  } catch (err) {
    console.error('Session login error:', err.message);
    return res.render('login', { error: 'Unexpected error during login', email: req.body && req.body.email || '', frontendUrl: FRONTEND_URL });
  }
};

// Logout: destroy session
exports.logout = (req, res) => {
  try {
    req.session.destroy((err) => {
      res.clearCookie(process.env.SESSION_NAME || 'awtc.sid');
      return res.redirect('/login');
    });
  } catch (err) {
    console.error('Logout error:', err.message);
    res.redirect('/login');
  }
};
