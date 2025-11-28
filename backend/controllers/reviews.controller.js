const { Reviews, User } = require('../models');
const fs = require('fs');
const path = require('path');

exports.createReview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Debes iniciar sesión.' });
    }

    const { content } = req.body;
    
    // Si Multer guardó una imagen, req.file existirá
    // Guardamos la ruta relativa para servirla después: /images/nombrearchivo.jpg
    const imagePath = req.file ? `/images/${req.file.filename}` : null;
    
    const review = await Reviews.create({ 
      content, 
      date: new Date(),
      image: imagePath, // Guardamos la ruta
      userId: req.user.id 
    });

    const reviewWithUser = await Reviews.findByPk(review.id, {
        include: [{ model: User, as: 'user', attributes: ['id', 'email', 'name'] }]
    });

    res.status(201).json(reviewWithUser);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error creating review', error });
  }
};

exports.getAllReviews = async (req, res) => {
    // ... (Tu código actual está bien aquí) ...
    try {
        const reviews = await Reviews.findAll({
          include: [{ model: User, as: 'user', attributes: ['id', 'email'] }],
          order: [['date', 'DESC']]
        });
        res.status(200).json(reviews);
      } catch (error) {
        res.status(500).json({ message: 'Error retrieving reviews', error });
      }
};

exports.updateReview = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'No autorizado.' });

    const { id } = req.params;
    const { content } = req.body; // 'image' ya no viene en body, viene en file

    const review = await Reviews.findByPk(id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso.' });
    }

    // Datos a actualizar
    let updateData = { 
        content, 
        date: new Date() 
    };

    // Si el usuario subió una NUEVA imagen, actualizamos el campo y borramos la vieja (opcional)
    if (req.file) {
        // Borrar imagen antigua para no llenar el servidor de basura (Opcional)
        if (review.image) {
             const oldPath = path.join(__dirname, '../public', review.image);
             if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updateData.image = `/images/${req.file.filename}`;
    }

    await review.update(updateData);

    res.status(200).json(review);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error updating review', error });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'No autorizado.' });

    const { id } = req.params;
    const review = await Reviews.findByPk(id);

    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso.' });
    }

    // Borrar el archivo de imagen asociado antes de borrar el registro (Buenas prácticas)
    if (review.image) {
        const imagePath = path.join(__dirname, '../public', review.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    }

    await review.destroy();
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting review', error });
  }
};