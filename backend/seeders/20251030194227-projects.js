"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "projects",
      [
        {
          name: "Planting trees",
          description: "Planting trees",
          start_date: new Date(),
          end_date: new Date(),
          location: "Gran Canaria",
          capacity: 30,
          status: "Active",
          createdAt: new Date(),
          updatedAt: new Date()
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    
      await queryInterface.bulkDelete('projects', null, {});
     
  },
};
