const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
  origin: ["https://awtc.netlify.app", "http://localhost:5173", "http://167.172.58.2:5173"],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Setting the view engine to ejs

app.set('view engine', 'ejs');



const authMiddleware = require("./middlewares/auth.middlewares");
app.use(authMiddleware);

const db = require("./models");
db.sequelize
  .sync({ force: false })
  .then(() => console.log("Database synced without dropping data!"))
  .catch((err) => console.error("DB Error:", err.message));

// Log available models to help debug dashboard data loading
console.log('Available models in db:', Object.keys(db));

// Helper: try model.findAll(), if it errors (e.g. unknown column) fallback to raw SELECT * from table
async function safeFindAll(model) {
  if (!model) return [];
  try {
    return await model.findAll();
  } catch (err) {
    try {
      const tableName = typeof model.getTableName === 'function' ? model.getTableName() : (model.tableName || model.name || null);
      if (!tableName) throw err;
      console.warn(`Model query failed for ${model.name}, falling back to raw SELECT * FROM ${tableName}:`, err.message);
      const [rows] = await db.sequelize.query(`SELECT * FROM \`${tableName}\``);
      return rows;
    } catch (err2) {
      console.error('Fallback raw query also failed for model', model && model.name, err2.message);
      return [];
    }
  }
}

// Debug route to inspect available models and a small sample of rows
app.get('/debug-models', async (req, res) => {
  const keys = Object.keys(db).filter(k => ['sequelize','Sequelize'].indexOf(k) === -1);
  const samples = {};
  for (const k of keys) {
    try {
      const model = db[k];
      const rows = await safeFindAll(model);
      samples[k] = { count: Array.isArray(rows) ? rows.length : 0, sample: (rows || []).slice(0,5) };
    } catch (err) {
      samples[k] = { error: err.message };
    }
  }
  res.json({ models: keys, samples });
});

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
const contactRoutes = require("./routes/contact.routes");

app.use("/api/projects", projectRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contacts", contactRoutes);

// Simple EJS dashboard routes (demo)
app.get('/', async (req, res) => {
  try {
    const projects = (await safeFindAll(db.Project)) || [];
    const users = (await safeFindAll(db.User)) || [];
    const categories = (await safeFindAll(db.Category)) || [];
    const reviews = (await safeFindAll(db.Reviews)) || [];
    const contacts = db.Contact ? (await safeFindAll(db.Contact)) : [];

    console.log(`Dashboard counts -> projects: ${projects.length}, users: ${users.length}, categories: ${categories.length}, reviews: ${reviews.length}`);

    res.render('index', {
      shopName: 'A Will To Change',
      projects: projects,
      projectsNumber: projects.length,
      users: users,
      usersNumber: users.length,
      categories: categories,
      categoriesNumber: categories.length,
      reviews: reviews,
      reviewsNumber: reviews.length,
      contacts: contacts,
      contactsNumber: contacts.length,
    });
  } catch (err) {
    console.error('Error fetching data for dashboard:', err.message);
    // On error, render dashboard with empty lists so page still loads
    res.render('index', {
      shopName: 'A Will To Change',
      projects: [],
      projectsNumber: 0,
      users: [],
      usersNumber: 0,
      categories: [],
      categoriesNumber: 0,
      reviews: [],
      reviewsNumber: 0,
    });
  }
});


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
