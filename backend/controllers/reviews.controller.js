const { Reviews } = require('../models');

// Crear un nuevo review
exports.createReview = async (req, res) => {
  try {
    const { content, date, image } = req.body;
    const review = await Reviews.create({ content, date, image });
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: 'Error creating review', error });
  }
};

// Obtener todos los reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Reviews.findAll();
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving reviews', error });
  }
};

// Actualizar un review
exports.updateReview = async (req, res) => {
  try {
    const review = await Reviews.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const { content, date, image } = req.body;
    await review.update({ content, date, image });
    res.status(200).json(review);
  } catch (error) {
    res.status(400).json({ message: 'Error updating review', error });
  }
};

// Eliminar un review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Reviews.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    await review.destroy();
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error });
  }
};
