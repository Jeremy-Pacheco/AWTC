const express = require('express');
const path = require('path');
const cors = require('cors'); // solo importa una vez

const app = express();

app.use(cors({
  origin: 'https://awtc.netlify.app', // sin barra final
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: false // usa true solo si necesitas cookies / autenticación
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Tus rutas API
const projectRoutes = require('./routes/project.routes');
const reviewRoutes = require('./routes/reviews.routes');
const categoryRoutes = require('./routes/category.routes');
app.use('/api/projects', projectRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);

// Backend base de datos
const db = require('./models');
db.sequelize.sync({ force: false })
  .then(() => console.log('Database updated without dropping data!'))
  .catch(err => console.log('Error: ' + err.message));

// Servir frontend estático
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// Catch-all SPA
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Puerto
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
module.exports = app;