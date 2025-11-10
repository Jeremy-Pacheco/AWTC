const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'SecretAWTCKey';

module.exports = async (req, res, next) => {
  try {
    if (!req.body) req.body = {};

    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return next();
    }

    if (authHeader.startsWith('Basic ')) {
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
      const [email, password] = credentials.split(':');

      if (!email || !password) return res.status(400).json({ message: 'Basic auth malformed' });

      req.body.email = email;
      req.body.password = password;

      return next();
    }

    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      let payload;
      try {
        payload = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }

      const user = await User.findByPk(payload.id);
      if (!user) return res.status(401).json({ message: 'User not found' });

      req.user = user;
      req.token = token;
      return next();
    }

    return res.status(401).json({ message: 'Unsupported authorization type' });
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ message: 'Authentication error' });
  }
};
