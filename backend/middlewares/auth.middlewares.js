const jwt = require('jsonwebtoken');
const { User } = require('../models');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'SecretAWTCKey';

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Authorization required' });

    let user;

    if (authHeader.startsWith('Bearer ')) {
      // JWT
      const token = authHeader.split(' ')[1];
      const payload = jwt.verify(token, JWT_SECRET);
      user = await User.findByPk(payload.id);
      if (!user) return res.status(403).json({ message: 'User not found' });

    } else if (authHeader.startsWith('Basic ')) {
      // Basic Auth
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
      const [email, password] = credentials.split(':');
      user = await User.findOne({ where: { email } });
      if (!user) return res.status(403).json({ message: 'User not found' });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(403).json({ message: 'Invalid credentials' });

    } else {
      return res.status(401).json({ message: 'Authentication type not supported' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};
