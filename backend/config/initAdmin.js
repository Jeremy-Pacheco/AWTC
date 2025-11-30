const bcrypt = require('bcrypt');
const { User } = require('../models');

async function initAdmin() {
  try {
    const adminEmail = 'admin@awtc.es';
    const adminPass = 'adminawtc1234';
    const defaultProfileImage = 'image-1764450311593.png';

    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    
    if (!existingAdmin) {
      await User.create({
          name: 'Admin',
          email: adminEmail,
          password: adminPass,
          role: 'admin',
          profileImage: defaultProfileImage
      });
      console.log(`Admin account created: ${adminEmail} with profileImage: ${defaultProfileImage}`);
    } else {
      // Actualizar password, role y profileImage
      existingAdmin.password = adminPass;
      existingAdmin.role = 'admin';
      existingAdmin.profileImage = defaultProfileImage;
      await existingAdmin.save();
      console.log(`Admin account updated: ${adminEmail} with profileImage: ${defaultProfileImage}`);
    }
  } catch (error) {
    console.error('Error creating admin:', error.message);
  }
}

module.exports = initAdmin;
