const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: DataTypes.STRING,
    password: DataTypes.STRING, // Aquí se guardará el hash
  }, {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const saltRounds = 10;
          const hash = await bcrypt.hash(user.password, saltRounds);
          user.password = hash;
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const saltRounds = 10;
          const hash = await bcrypt.hash(user.password, saltRounds);
          user.password = hash;
        }
      }
    }
  });

  return User;
};
