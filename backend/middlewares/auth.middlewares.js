const { User } = require('../models');
const bcrypt = require('bcrypt');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).send('Authorization required'); // [web:1]
  }
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
  const [username, password] = credentials.split(':');

  // Buscar usuario en la base de datos
  const user = await User.findOne({ where: { username } }); // [web:1]

  if (!user) {
    return res.status(403).send('User not found'); // [web:1]
  }

  // Comparar la contraseña con bcrypt
  const passwordMatch = await bcrypt.compare(password, user.password); // [web:1]
  if (passwordMatch) {
    return next(); // [web:1]
  } else {
    return res.status(403).send('Invalid credentials'); // [web:1]
  }
};
