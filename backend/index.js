const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

// public directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  cors({
    origin: ["https://awtc.netlify.app", "http://localhost:5173", "http://167.172.58.2:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: false,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authMiddleware = require("./middlewares/auth.middlewares");
app.use(authMiddleware);

const db = require("./models");
db.sequelize
  .sync({ force: false })
  .then(() => console.log("Database synced without dropping data!"))
  .catch((err) => console.error("DB Error:", err.message));

const initAdmin = require("./config/initAdmin");

db.sequelize
  .sync({ force: false })
  .then(async () => {
    console.log("Database updated without dropping data!");
    await initAdmin();
  })
  .catch((err) => console.log("Error: " + err.message));

const projectRoutes = require("./routes/project.routes");
const reviewRoutes = require("./routes/reviews.routes");
const categoryRoutes = require("./routes/category.routes");
const userRoutes = require("./routes/user.routes");

app.use("/api/projects", projectRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);


const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

app.use((req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(frontendPath, "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
