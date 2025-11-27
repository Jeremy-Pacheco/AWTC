'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
// Use the new JS config which loads env vars
const config = require(__dirname + '/../config/sequelize.config.js')[env];
const db = {};

let sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Ensure Contact model is loaded if present
try {
  const contactModel = require(path.join(__dirname, 'contact.js'))(sequelize, Sequelize.DataTypes);
  db[contactModel.name] = contactModel;
} catch (err) {
  // ignore if contact model already loaded or missing
}

// Ensure UserProjectBan model is loaded if present
try {
  const banModel = require(path.join(__dirname, 'userprojectban.js'))(sequelize, Sequelize.DataTypes);
  db[banModel.name] = banModel;
} catch (err) {
  // ignore if userprojectban model already loaded or missing
}

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Define many-to-many association between User and Project via UserProject join table
if (db.User && db.Project && db.UserProject) {
  db.User.belongsToMany(db.Project, { through: db.UserProject, foreignKey: 'userId', otherKey: 'projectId' });
  db.Project.belongsToMany(db.User, { through: db.UserProject, foreignKey: 'projectId', otherKey: 'userId' });

  // Also expose direct hasMany/hasOne relationships to the join model
  db.User.hasMany(db.UserProject, { foreignKey: 'userId' });
  db.Project.hasMany(db.UserProject, { foreignKey: 'projectId' });
}

// Optional: expose bans relationship
if (db.User && db.Project && db.UserProject && db.UserProjectBan) {
  // A user can have many bans
  db.User.hasMany(db.UserProjectBan, { foreignKey: 'userId' });
  db.Project.hasMany(db.UserProjectBan, { foreignKey: 'projectId' });
  db.UserProjectBan.belongsTo(db.User, { foreignKey: 'userId' });
  db.UserProjectBan.belongsTo(db.Project, { foreignKey: 'projectId' });
}

// Define relationship between Category and Project
if (db.Category && db.Project) {
  db.Category.hasMany(db.Project, { foreignKey: 'categoryId', as: 'projects' });
  db.Project.belongsTo(db.Category, { foreignKey: 'categoryId', as: 'category' });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;