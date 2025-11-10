const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const utils = require('../utils/utils');

const JWT_SECRET = process.env.JWT_SECRET || 'SecretAWTCKey';

// Register
exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Missing data' });

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email is already registered' });

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

// Sign in
exports.login = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Basic '))
      return res.status(400).json({ message: 'Authorization header required' });

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



// Create coordinator (admin only)
exports.createCoordinator = async (req, res) => {
  try {
    const authUser = req.user;
    if (authUser.role !== 'admin')
      return res.status(403).json({ message: 'Only administrators can create coordinators' });

    const { name, email, password } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email is already registered' });

    const user = await User.create({ name, email, password, role: 'coordinator' });
    res.status(201).json({ message: 'Coordinator created', user });
  } catch (error) {
    res.status(500).json({ message: 'Error creating coordinator' });
  }
};

// Get all users (admin or coordinator only)
exports.getUsers = async (req, res) => {
  try {
    const authUser = req.user;
    if (!['admin', 'coordinator'].includes(authUser.role))
      return res.status(403).json({ message: 'Unauthorized' });

    const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role'] });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users' });
  }
};

// Change user role (admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const authUser = req.user;
    if (authUser.role !== 'admin')
      return res.status(403).json({ message: 'Only administrators can change roles' });

    const { id } = req.params;
    const { role } = req.body;

    if (!['volunteer', 'coordinator', 'admin'].includes(role))
      return res.status(400).json({ message: 'Invalid role' });

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.update({ role });
    res.json({ message: `User role updated to ${role}`, user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating role' });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const authUser = req.user;
    if (authUser.role !== 'admin')
      return res.status(403).json({ message: 'Only administrators can delete users' });

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};
