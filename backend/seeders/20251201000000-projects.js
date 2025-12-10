"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get the categories
    const [environment] = await queryInterface.sequelize.query(
      `SELECT id FROM Categories WHERE name = 'Environment' LIMIT 1`
    );
    
    const [community] = await queryInterface.sequelize.query(
      `SELECT id FROM Categories WHERE name = 'Community' LIMIT 1`
    );
    
    const [health] = await queryInterface.sequelize.query(
      `SELECT id FROM Categories WHERE name = 'Health' LIMIT 1`
    );
    
    const [education] = await queryInterface.sequelize.query(
      `SELECT id FROM Categories WHERE name = 'Education' LIMIT 1`
    );
    
    const environmentId = environment && environment.length > 0 ? environment[0].id : null;
    const communityId = community && community.length > 0 ? community[0].id : null;
    const healthId = health && health.length > 0 ? health[0].id : null;
    const educationId = education && education.length > 0 ? education[0].id : null;

    await queryInterface.bulkInsert(
      "Projects",
      [
        {
          name: "Planting trees",
          description: "Join us in an impactful reforestation project in the heart of Gran Canaria's mountains. Volunteers will plant native trees, restore degraded areas, and help protect local ecosystems. Activities include preparing the soil, planting saplings, watering, and learning about sustainable forestry practices. This project is perfect for those who want hands-on experience in environmental restoration while enjoying breathtaking natural landscapes.",
          start_date: new Date(),
          end_date: new Date(),
          location: "Tejeda, Gran Canaria",
          capacity: 30,
          status: "Active",
          filename: "project-planting-trees.jpg",
          categoryId: environmentId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Community Support Program",
          description: "Be part of a program designed to strengthen local communities in Vegueta, Las Palmas de Gran Canaria. Volunteers will assist families, organize community activities, provide mentorship, and support educational and social initiatives. Tasks include helping at community centers, coordinating workshops, and raising awareness about social services. This project is ideal for those who want to make a tangible difference in the lives of residents while learning about community engagement.",
          start_date: new Date(),
          end_date: new Date(),
          location: "Vegueta, Gran Canaria",
          capacity: 25,
          status: "Active",
          filename: "project-community-support.jpg",
          categoryId: communityId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Beach Clean-Up",
          description: "Join us to protect one of Gran Canaria's most iconic beaches! Volunteers will participate in cleaning and maintaining Playa de Las Canteras, collecting waste, and educating visitors on responsible coastal practices. Activities include beach clean-ups, sorting recyclables, and raising awareness about marine conservation. This project is perfect for those who want hands-on experience in environmental protection while enjoying the beauty of a natural coastal area.",
          start_date: new Date(),
          end_date: new Date(),
          location: "Playa de Las Canteras, Gran Canaria",
          capacity: 30,
          status: "Active",
          filename: "project-beach-clean-up.png",
          categoryId: environmentId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Smiles for All",
          description: "Join our oral health initiative in Telde, where volunteers help promote dental hygiene and prevent disease in vulnerable communities. Activities include running interactive workshops, guiding children and adults on proper oral care, distributing dental kits, and assisting in preventive dental check-ups. This project is perfect for volunteers passionate about health education and community support, making a real difference in everyday lives while learning about public health practices.",
          start_date: new Date(),
          end_date: new Date(),
          location: "Telde, Gran Canaria",
          capacity: 25,
          status: "Active",
          filename: "project-smiles-for-all.png",
          categoryId: healthId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Living Libraries",
          description: "Help foster literacy and a love for reading in San Mateo, Gran Canaria. Volunteers will create interactive reading spaces, host storytelling sessions, organize book clubs, and support students with study skills and tutoring. Activities also include community outreach, educational games, and promoting reading habits among children and young adults. This project is ideal for those passionate about education, literacy, and empowering youth through knowledge.",
          start_date: new Date(),
          end_date: new Date(),
          location: "San Mateo, Gran Canaria",
          capacity: 25,
          status: "Active",
          filename: "project-living-libraries.png",
          categoryId: educationId,
          createdAt: new Date(),
          updatedAt: new Date()
        }, 
      ],
      {
        ignoreDuplicates: true
      }
    );
  },

  async down(queryInterface, Sequelize) {
    
      await queryInterface.bulkDelete('Projects', null, {});
     
  },
};
