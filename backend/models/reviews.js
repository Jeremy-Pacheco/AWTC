'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Reviews extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Association moved to models/index.js
    }
  }

  Reviews.init({
    content: DataTypes.TEXT,
    date: DataTypes.DATE,
    image: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Reviews',
  });

  return Reviews;
};