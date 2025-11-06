const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// CORS primero
app.use(cors({
  origin: 'https://awtc.netlify.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Models + DB
const db = require('./models');
db.sequelize.sync({ force: false })
  .then(() => console.log('Database updated without dropping data!'))
  .catch(err => console.log('Error: ' + err.message));

// Tus rutas principales
const projectRoutes = require('./routes/project.routes');
const reviewRoutes = require('./routes/reviews.routes');
const categoryRoutes = require('./routes/category.routes');

app.use('/api/projects', projectRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);

// Ruta protegida con middleware de auth
const authMiddleware = require('./middlewares/auth.middlewares');
app.get('/api/privado', authMiddleware, (req, res) => {
  res.json({ mensaje: "¡Acceso autenticado!" });
});

// Servir frontend de React/Vite
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// Catch-all para SPA
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next(); // no intercepta rutas de API
  res.sendFile(path.join(frontendPath, 'index.html'));
});


// Puerto
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
