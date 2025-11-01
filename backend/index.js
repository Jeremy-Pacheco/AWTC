const express = require('express');
const path = require('path');
const app = express();

const projectRoutes = require('./routes/project.routes');
const reviewRoutes = require('./routes/reviews.routes');
const categoryRoutes = require('./routes/category.routes');

const db = require('./models');

// Middleware para JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar base de datos
db.sequelize.sync({ force: false })
  .then(() => console.log('Database updated without dropping data!'))
  .catch(err => console.log('Error: ' + err.message));

// Rutas API
app.use('/api/projects', projectRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);

// Servir frontend
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// Catch-all para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Puerto
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});