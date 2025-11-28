const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviews.controller');
const authMiddleware = require('../middlewares/auth.middlewares'); // Asegúrate de importar tu middleware
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- 1. CONFIGURACIÓN DE MULTER ---
// Verificamos que la carpeta exista, si no, la crea (opcional, pero recomendado)
const uploadDir = path.join(__dirname, '../public/images');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Guarda en public/images
  },
  filename: (req, file, cb) => {
    // Nombre único: timestamp + extensión original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// --- 2. RUTAS ---

// POST: Crear review (Protegido + Subida de imagen)
router.post('/', 
    authMiddleware, 
    upload.single('image'), // 'image' es el nombre del campo en el FormData del frontend
    reviewsController.createReview
);

// GET: Obtener todas (Público)
router.get('/', reviewsController.getAllReviews);

// PUT: Editar review (Protegido + Opcional imagen nueva)
router.put('/:id', 
    authMiddleware, 
    upload.single('image'), 
    reviewsController.updateReview
);

// DELETE: Borrar review (Protegido)
router.delete('/:id', 
    authMiddleware, 
    reviewsController.deleteReview
);

module.exports = router;