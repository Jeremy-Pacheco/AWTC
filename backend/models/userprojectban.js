'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserProjectBan = sequelize.define('UserProjectBan', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {});

  UserProjectBan.associate = function(models) {
    // keep references for convenience
    UserProjectBan.belongsTo(models.User, { foreignKey: 'userId' });
    UserProjectBan.belongsTo(models.Project, { foreignKey: 'projectId' });
  };

  return UserProjectBan;
};
