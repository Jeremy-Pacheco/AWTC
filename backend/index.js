const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      "https://awtc.netlify.app",
      "http://localhost:5173",
      "http://localhost:8080",
      "http://167.172.58.2:5173",
      "http://209.97.187.131:5173",
      "http://209.97.187.131:8080"
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: false,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Setting the view engine to ejs

app.set('view engine', 'ejs');



const cookieParser = require('cookie-parser');
const session = require('express-session');

// Parse cookies first so we can access session cookie
app.use(cookieParser());

// Session middleware for EJS/admin area (uses cookies)
app.use(session({
  name: process.env.SESSION_NAME || 'awtc.sid',
  secret: process.env.SESSION_SECRET || 'awtc_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

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

// Auth middleware that supports Bearer/Basic headers (keeps API auth intact)
const authMiddleware = require("./middlewares/auth.middlewares");
app.use(authMiddleware);

// If a session exists, attach the user to req.user so EJS routes can use it.
app.use(async (req, res, next) => {
  try {
    if (!req.user && req.session && req.session.userId) {
      const user = await db.User.findByPk(req.session.userId);
      req.user = user || null;
    }
  } catch (err) {
    console.error('Session attach error:', err.message);
    req.user = null;
  }
  next();
});

db.sequelize
  .sync({ force: false })
  .then(async () => {
    console.log("Database synced!");
    console.log("Initializing admin user...");
    await initAdmin();
  })
  .catch((err) => console.error("DB Error: " + err.message));

const projectRoutes = require("./routes/project.routes");
const reviewRoutes = require("./routes/reviews.routes");
const categoryRoutes = require("./routes/category.routes");
const userRoutes = require("./routes/user.routes");
const contactRoutes = require("./routes/contact.routes");
const sessionRoutes = require("./routes/session.routes");

app.use("/api/projects", projectRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contacts", contactRoutes);
// Session/login routes for EJS admin area
app.use('/', sessionRoutes);

// Simple EJS dashboard routes (demo)
// Helper to gather dashboard data used by multiple routes
async function getDashboardData() {
  const projects = (await safeFindAll(db.Project)) || [];
  const users = (await safeFindAll(db.User)) || [];
  const categories = (await safeFindAll(db.Category)) || [];
  const reviews = (await safeFindAll(db.Reviews)) || [];
  const contacts = db.Contact ? (await safeFindAll(db.Contact)) : [];

  const recent = (arr, n = 5) => {
    if (!Array.isArray(arr)) return [];
    const copy = arr.slice();
    copy.sort((a,b) => {
      const aDate = a && (a.createdAt || a.created_at || a.date) ? new Date(a.createdAt || a.created_at || a.date) : null;
      const bDate = b && (b.createdAt || b.created_at || b.date) ? new Date(b.createdAt || b.created_at || b.date) : null;
      if (aDate && bDate) return bDate - aDate;
      if (aDate) return -1;
      if (bDate) return 1;
      return (b.id || 0) - (a.id || 0);
    });
    return copy.slice(0, n);
  };

  const result = {
    projects,
    users,
    categories,
    reviews,
    contacts,
    latestUsers: recent(users,6),
    latestProjects: recent(projects,6),
    latestReviews: recent(reviews,10)
  };

  // Compute volunteers per project and projects with volunteer list if join model is defined
  try {
    if (db.UserProject && db.Project && db.User) {
      // counts per project
      const [userCounts] = await db.sequelize.query(
        `SELECT p.id as projectId, p.name as projectName, COUNT(up.userId) as volunteersCount
         FROM \`Projects\` p
         LEFT JOIN \`UserProjects\` up ON up.projectId = p.id
         GROUP BY p.id, p.name`
      );
      result.usersPerProject = userCounts;

      // Additionally, load the projects with users (when many-to-many is supported)
      try {
        const projectsWithVolunteers = await db.Project.findAll({
          include: [{ model: db.User, through: { attributes: ['status','role'] } }]
        });
        result.projectsWithVolunteers = projectsWithVolunteers;
      } catch (err) {
        result.projectsWithVolunteers = null;
      }
    }
  } catch (err) {
    console.warn('Could not compute usersPerProject or projectsWithVolunteers:', err.message);
    result.usersPerProject = null;
    result.projectsWithVolunteers = null;
  }

  return result;
}

// Render dashboard with specified section
async function renderDashboard(req, res, section = 'overview') {
  if (!req.user) return res.redirect('/login');
  try {
    const data = await getDashboardData();
    console.log(`Dashboard counts -> projects: ${data.projects.length}, users: ${data.users.length}, categories: ${data.categories.length}, reviews: ${data.reviews.length}`);
    // compute current user's registrations and bans if any
    const userRegisteredProjectIds = req.user ? (await db.UserProject.findAll({ where: { userId: req.user.id } })).map(r => r.projectId) : [];
    const userBannedProjectIds = req.user ? (await db.UserProjectBan.findAll({ where: { userId: req.user.id } })).map(b => b.projectId) : [];

    res.render('index', Object.assign({
      shopName: 'A Will To Change',
      currentUser: req.user || null,
      currentSection: section,
      userRegisteredProjectIds: userRegisteredProjectIds,
      userBannedProjectIds: userBannedProjectIds,
      projectsNumber: Array.isArray(data.projects) ? data.projects.length : 0,
      usersNumber: Array.isArray(data.users) ? data.users.length : 0,
      categoriesNumber: Array.isArray(data.categories) ? data.categories.length : 0,
      reviewsNumber: Array.isArray(data.reviews) ? data.reviews.length : 0,
      contactsNumber: Array.isArray(data.contacts) ? data.contacts.length : 0
    }, data));
  } catch (err) {
    console.error('Error fetching data for dashboard:', err.message);
    res.render('index', {
      shopName: 'A Will To Change',
      projects: [], projectsNumber: 0,
      users: [], usersNumber: 0,
      categories: [], categoriesNumber: 0,
      reviews: [], reviewsNumber: 0,
      contacts: [], contactsNumber: 0,
      currentUser: req.user || null,
      currentSection: section
    });
  }
}

app.get('/', (req, res) => renderDashboard(req, res, 'overview'));
app.get('/projects', (req, res) => renderDashboard(req, res, 'projects'));
app.get('/projects/:id/volunteers', async (req, res) => {
  if (!req.user) return res.redirect('/login');
  try {
    const projectId = parseInt(req.params.id, 10);
    const data = await getDashboardData();
    const project = await db.Project.findByPk(projectId, { include: [{ model: db.User, through: { attributes: ['status','role'] } }] });
    if (!project) return res.redirect('/projects');
    const volunteers = project.Users || [];
    res.render('index', Object.assign({
      shopName: 'A Will To Change',
      currentUser: req.user || null,
      currentSection: 'projects',
      projectVolunteers: volunteers,
      projectName: project.name
    }, data));
  } catch (err) {
    console.error('Error loading project volunteers:', err.message);
    res.redirect('/projects');
  }
});
app.get('/users', (req, res) => renderDashboard(req, res, 'users'));
app.get('/reviews', (req, res) => renderDashboard(req, res, 'reviews'));
app.get('/contacts', (req, res) => renderDashboard(req, res, 'contacts'));


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