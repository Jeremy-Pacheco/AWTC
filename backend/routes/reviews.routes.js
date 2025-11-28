const express = require("express");
const router = express.Router();
const reviewsController = require("../controllers/reviews.controller");
const authMiddleware = require("../middlewares/auth.middlewares");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../public/images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  reviewsController.createReview
);
router.get("/", reviewsController.getAllReviews);

router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  reviewsController.updateReview
);

router.delete("/:id", authMiddleware, reviewsController.deleteReview);

module.exports = router;
