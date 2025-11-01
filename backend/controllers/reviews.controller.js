const { Reviews } = require('../models');

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const review = await Reviews.create(req.body);
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: 'Error creating review', error });
  }
};

// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Reviews.findAll();
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving reviews', error });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const review = await Reviews.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    await review.update(req.body);
    res.status(200).json(review);
  } catch (error) {
    res.status(400).json({ message: 'Error updating review', error });
  }
};

// Delete a review
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
