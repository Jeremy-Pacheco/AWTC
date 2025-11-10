// index.js
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// --------------------
// MIDDLEWARES
// --------------------

// CORS: permite frontend local y producción
app.use(cors({
  origin: [
    'https://awtc.netlify.app',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: false
}));

// Para recibir JSON y formularios URL encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------
// BASE DE DATOS
// --------------------
const db = require('./models');
db.sequelize.sync({ force: false })
  .then(() => console.log('✅ Database synced without dropping data!'))
  .catch(err => console.error('❌ DB Error:', err.message));

const initAdmin = require('./config/initAdmin');

db.sequelize.sync({ force: false })
  .then(async () => {
    console.log('Database updated without dropping data!');
    await initAdmin();  // <-- esto crea la cuenta admin si no existe
  })
  .catch(err => console.log('Error: ' + err.message));

// --------------------
// RUTAS API
// --------------------
const projectRoutes = require('./routes/project.routes');
const reviewRoutes = require('./routes/reviews.routes');
const categoryRoutes = require('./routes/category.routes');
const userRoutes = require('./routes/user.routes'); // <-- rutas de usuarios
const authMiddleware = require('./middlewares/auth.middlewares');

app.use('/api/projects', projectRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);

// Ruta protegida de prueba
app.get('/api/privado', authMiddleware, (req, res) => {
  res.json({ mensaje: "¡Acceso autenticado!" });
});

// --------------------
// SERVIR FRONTEND
// --------------------
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// Catch-all para SPA (solo si NO es ruta API)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// --------------------
// PUERTO
// --------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
