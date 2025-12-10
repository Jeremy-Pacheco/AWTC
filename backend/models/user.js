const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: { isEmail: true },
    },
    role: {
      type: DataTypes.ENUM('volunteer', 'coordinator', 'admin'),
      defaultValue: 'volunteer',
      allowNull: false,
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    hooks: {}
  });
  User.associate = (models) => {
    User.hasMany(models.Reviews, {
      foreignKey: 'userId',
      as: 'reviews'
    });
  };

  return User;
};
