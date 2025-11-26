'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserProject = sequelize.define('UserProject', {
    status: {
      // Only accepted as valid state; we will delete records to "reject" or when a user unsubscribes
      type: DataTypes.ENUM('accepted'),
      defaultValue: 'accepted'
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {});

  UserProject.associate = function(models) {
    // A join table connecting User and Project
    UserProject.belongsTo(models.User, { foreignKey: 'userId' });
    UserProject.belongsTo(models.Project, { foreignKey: 'projectId' });
  };

  return UserProject;
};
