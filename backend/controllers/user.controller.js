const { User } = require('../models');
const bcrypt = require('bcrypt');
const utils = require('../utils/utils');

// ✅ Crear usuario (registro)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing data' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const user = await User.create({ name, email, password, role: 'volunteer' });

    const token = utils.generateToken(user);
    const cleanUser = utils.getCleanUser(user);

    res.status(201).json({
      message: 'User created successfully',
      user: cleanUser,
      access_token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

// ✅ Iniciar sesión
exports.login = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(400).json({ message: 'Authorization header required' });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = utils.generateToken(user);
    const cleanUser = utils.getCleanUser(user);

    res.json({
      message: 'Login successful',
      user: cleanUser,
      access_token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error signing in' });
  }
};

// ✅ Crear coordinador (solo admin — se valida en middleware)
exports.createCoordinator = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const user = await User.create({ name, email, password, role: 'coordinator' });

    res.status(201).json({ message: 'Coordinator created successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating coordinator' });
  }
};

// ✅ Obtener todos los usuarios (solo admin o coordinador — se valida en middleware)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role'],
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving users' });
  }
};

// ✅ Cambiar rol de usuario (solo admin — se valida en middleware)
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['volunteer', 'coordinator', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.update({ role });
    res.json({ message: `User role updated to ${role}`, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating role' });
  }
};

// ✅ Eliminar usuario (solo admin — se valida en middleware)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};
