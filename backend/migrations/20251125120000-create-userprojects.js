'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserProjects', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      projectId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Projects', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('accepted'),
        defaultValue: 'accepted'
      },
      role: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    // Ensure a user cannot register multiple times to the same project
    await queryInterface.addConstraint('UserProjects', {
      fields: ['userId', 'projectId'],
      type: 'unique',
      name: 'unique_user_project'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserProjects');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_UserProjects_status;');
  }
};
