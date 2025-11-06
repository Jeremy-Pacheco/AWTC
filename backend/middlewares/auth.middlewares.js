// middlewares/auth.middleware.js
const { User } = require('../models');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).send('Authorization required');
  }
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
  const [username, password] = credentials.split(':');

  // Buscar usuario en la base de datos
  const user = await User.findOne({ where: { username } });
  if (!user) {
    return res.status(403).send('User not found');
  }

  // Comparar la contraseña
  if (user.password === password) { // Mejor: usar bcrypt.compare(hash)
    return next();
  } else {
    return res.status(403).send('Invalid credentials');
  }
};
