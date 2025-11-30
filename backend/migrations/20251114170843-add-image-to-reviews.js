"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Reviews");
    if (!table.image) {
      await queryInterface.addColumn("Reviews", "image", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Reviews");
    if (table.image) {
      await queryInterface.removeColumn("Reviews", "image");
    }
  },
};
