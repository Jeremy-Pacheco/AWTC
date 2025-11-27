'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Agregamos la columna userId a la tabla Reviews
    await queryInterface.addColumn('reviews', 'userId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'users', // Nombre de la tabla de usuarios (revisa si en tu DB es 'Users' o 'users')
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // O 'CASCADE' si quieres borrar las reviews si se borra el usuario
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Reviews', 'userId');
  }
};