const bcrypt = require('bcrypt');
const { User } = require('../models');

async function initAdmin() {
  const existingAdmin = await User.findOne({ where: { role: 'admin' } });
  if (!existingAdmin) {
    await User.create({
        name: 'Admin',
        email: 'admin@awtc.es',
        password: 'adminawtc1234',
        role: 'admin'
    });
    console.log('✅ Cuenta admin creada: admin@awtc.es / adminawtc1234');
  } else {
    console.log('Admin ya existente');
  }
}

module.exports = initAdmin;
