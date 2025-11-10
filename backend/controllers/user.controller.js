const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'SecretAWTCKey';
const JWT_EXPIRES = '24h';

// Crear usuario (signup) - siempre volunteer
exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Faltan datos' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'El email ya está registrado' });

    const user = await User.create({ name, email, password, role: 'volunteer' });

    // Crear token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.status(201).json({
      message: 'Usuario creado como voluntario',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creando usuario' });
  }
};

// Login con JWT
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(403).json({ message: 'Credenciales inválidas' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({
      message: 'Login exitoso',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Error iniciando sesión' });
  }
};


// Crear coordinador (solo admin)
exports.createCoordinator = async (req, res) => {
  try {
    const authUser = req.user; // viene del middleware de autenticación
    if (authUser.role !== 'admin')
      return res.status(403).json({ message: 'Solo los administradores pueden crear coordinadores' });

    const { name, email, password } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'El email ya está registrado' });

    const user = await User.create({ name, email, password, role: 'coordinator' });
    res.status(201).json({ message: 'Coordinador creado', user });
  } catch (error) {
    res.status(500).json({ message: 'Error creando coordinador' });
  }
};

// Obtener todos los usuarios (solo admin o coordinador)
exports.getUsers = async (req, res) => {
  try {
    const authUser = req.user;
    if (!['admin', 'coordinator'].includes(authUser.role))
      return res.status(403).json({ message: 'No autorizado' });

    const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role'] });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo usuarios' });
  }
};

// Cambiar rol de usuario (solo admin)
exports.updateUserRole = async (req, res) => {
  try {
    const authUser = req.user;
    if (authUser.role !== 'admin')
      return res.status(403).json({ message: 'Solo los administradores pueden cambiar roles' });

    const { id } = req.params;
    const { role } = req.body;

    if (!['volunteer', 'coordinator', 'admin'].includes(role))
      return res.status(400).json({ message: 'Rol inválido' });

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    await user.update({ role });
    res.json({ message: `Rol de usuario actualizado a ${role}`, user });
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando rol' });
  }
};

// Eliminar usuario (solo admin)
exports.deleteUser = async (req, res) => {
  try {
    const authUser = req.user;
    if (authUser.role !== 'admin')
      return res.status(403).json({ message: 'Solo los administradores pueden eliminar usuarios' });

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    await user.destroy();
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando usuario' });
  }
};
