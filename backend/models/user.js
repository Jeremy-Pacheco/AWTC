// models/user.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: DataTypes.STRING,
    password: DataTypes.STRING, // idealmente deberías guardar el hash, no la contraseña en claro
  });
  return User;
};
