"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable("Projects");
    if (!tableDescription.filename) {
      await queryInterface.addColumn("Projects", "filename", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable("Projects");
    if (tableDescription.filename) {
      await queryInterface.removeColumn("Projects", "filename");
    }
  },
};
