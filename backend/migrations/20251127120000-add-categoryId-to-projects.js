'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Primero, verificar si la columna ya existe
    const table = await queryInterface.describeTable('Projects');
    
    if (!table.categoryId) {
      await queryInterface.addColumn('Projects', 'categoryId', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    }
    
    // Agregar la foreign key constraint
    try {
      await queryInterface.addConstraint('Projects', {
        fields: ['categoryId'],
        type: 'foreign key',
        name: 'fk_projects_categoryId',
        references: {
          table: 'Categories',
          field: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      });
    } catch (error) {
      console.log('Foreign key constraint already exists or error:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeConstraint('Projects', 'fk_projects_categoryId');
    } catch (error) {
      console.log('Constraint not found:', error.message);
    }
    
    const table = await queryInterface.describeTable('Projects');
    if (table.categoryId) {
      await queryInterface.removeColumn('Projects', 'categoryId');
    }
  }
};
