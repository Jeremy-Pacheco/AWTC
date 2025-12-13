const { Reviews, User } = require("../models");
const { sendNotificationToUser } = require("./subscription.controller");
const { getIO } = require("../config/socket");
const fs = require("fs");
const path = require("path");

exports.createReview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Debes iniciar sesión." });
    }

    const { content } = req.body;

    const imagePath = req.file ? `/images/${req.file.filename}` : null;

    const review = await Reviews.create({
      content,
      date: new Date(),
      image: imagePath,
      userId: req.user.id,
    });

    const reviewWithUser = await Reviews.findByPk(review.id, {
      include: [
        { model: User, as: "user", attributes: ["id", "email", "name"] },
      ],
    });

    res.status(201).json(reviewWithUser);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error creating review", error });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Reviews.findAll({
      include: [{ model: User, as: "user", attributes: ["id", "email", "name"] }],
      order: [["date", "DESC"]],
    });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving reviews", error });
  }
};

exports.updateReview = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "No autorizado." });

    const { id } = req.params;
    const { content } = req.body;

    const review = await Reviews.findByPk(id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: "No tienes permiso." });
    }

    let updateData = {
      content,
      date: new Date(),
    };

    if (req.file) {
      if (review.image) {
        const oldPath = path.join(__dirname, "../public", review.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.image = `/images/${req.file.filename}`;
    }

    await review.update(updateData);

    res.status(200).json(review);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error updating review", error });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "No autorizado." });

    const { id } = req.params;
    const review = await Reviews.findByPk(id);

    if (!review) return res.status(404).json({ message: "Review not found" });

    const isAdmin = req.user.role === "admin";
    const isOwner = review.userId === req.user.id;

    // Allow admins to delete any review, or users to delete their own
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "No tienes permiso." });
    }

    if (review.image) {
      const imagePath = path.join(__dirname, "../public", review.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    const reviewOwnerId = review.userId;
    const reviewId = review.id;
    const reviewSnippet = review.content
      ? `${review.content.slice(0, 90)}${review.content.length > 90 ? "..." : ""}`
      : "tu reseña";

    await review.destroy();

    // Notify the review owner when an admin deletes their review
    if (isAdmin && !isOwner) {
      // Emit socket event for real-time update
      try {
        const io = getIO();
        io.emit('review_deleted', { reviewId, userId: reviewOwnerId });
        console.log(`Socket event emitted: review_deleted for review ${reviewId}`);
      } catch (socketError) {
        console.error("Error emitting socket event:", socketError);
      }

      // Send push notification
      const payload = {
        title: "Your review was deleted",
        body: `An administrator deleted your review: "${reviewSnippet}"`,
        icon: "/images/logo.png",
        tag: `review-${reviewId}-deleted-${Date.now()}`,
        data: {
          url: "/reviews",
          reviewId,
        },
      };

      try {
        const notifyResult = await sendNotificationToUser(reviewOwnerId, payload);
        console.log("Push notification result:", notifyResult);
      } catch (notifyError) {
        console.error("Error sending review deletion notification:", notifyError);
      }
    }

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting review", error });
  }
};
