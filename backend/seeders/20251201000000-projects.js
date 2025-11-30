"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get the Environment and Community categories
    const [environment] = await queryInterface.sequelize.query(
      `SELECT id FROM Categories WHERE name = 'Environment' LIMIT 1`
    );
    
    const [community] = await queryInterface.sequelize.query(
      `SELECT id FROM Categories WHERE name = 'Community' LIMIT 1`
    );
    
    const environmentId = environment && environment.length > 0 ? environment[0].id : null;
    const communityId = community && community.length > 0 ? community[0].id : null;

    await queryInterface.bulkInsert(
      "Projects",
      [
        {
          name: "Planting trees",
          description: "Join us in planting trees to help protect our environment and combat climate change. This project brings together volunteers to make a positive impact on our planet.",
          start_date: new Date(),
          end_date: new Date(),
          location: "Gran Canaria",
          capacity: 30,
          status: "Active",
          filename: "image-1764348145705.jpg",
          categoryId: environmentId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Community Support Program",
          description: "Help us strengthen our local community through support programs, mentorship, and social initiatives. We're building a stronger, more connected neighborhood together.",
          start_date: new Date(),
          end_date: new Date(),
          location: "Las Palmas",
          capacity: 25,
          status: "Active",
          filename: "comunidad.jpg",
          categoryId: communityId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    
      await queryInterface.bulkDelete('Projects', null, {});
     
  },
};
