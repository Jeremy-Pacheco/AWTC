const express = require('express');
const path = require('path');
const app = express();

const projectRoutes = require('./routes/project.routes');
const reviewRoutes = require('./routes/reviews.routes');
const categoryRoutes = require('./routes/category.routes');

const db = require('./models');

// Middleware
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



// Servir frontend estático
const frontendPath = path.join(__dirname, '../frontend/dist');
console.log('Looking for frontend in:', frontendPath);
app.use(express.static(frontendPath));

// Catch-all SPA: cualquier ruta que no empiece con /api
app.use((req, res, next) => {
if (req.path.startsWith('/api')) return next(); // ignorar rutas API
res.sendFile(path.join(frontendPath, 'index.html'));
});

// Puerto
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});

//!Newly added CORS configuration
const cors = require('cors');
app.use(cors({
    origin: 'https://awtc.netlify.app/',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

const cors = require('cors');

app.use(cors({
  origin: 'https://awtc.netlify.app', // exactamente igual, SIN barra final
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: false // solo true si usas autenticación por cookies
}));

// Luego tus rutas (ejemplo)
app.get('/api/reviews', '/api/projects', 'api/categories');
