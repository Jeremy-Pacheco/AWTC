const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const swaggerUI = require("swagger-ui-express");
const swaggerSpecs = require("./swagger");
const { isAdmin } = require('./middlewares/role.middlewares');
const morgan = require('morgan');
const logger = require('./utils/logger');

const env = process.env.NODE_ENV || 'development';
const envPath = path.resolve(__dirname, `.env.${env}`);
dotenv.config({ path: envPath });

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const app = express();

// Use morgan to log HTTP requests via winston
const morganFormat = ":method :url :status :response-time ms";
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:8080",
      "https://localhost:5173",
      "https://localhost:8443",
      "http://209.97.187.131:5173",
      "http://209.97.187.131:8080",
      "https://209.97.187.131",
      "https://awtc.com",
      "https://www.awtc.com"
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI Configuration
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpecs));
app.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpecs);
});

//Setting the view to ejs
app.set('view engine', 'ejs');

const cookieParser = require('cookie-parser');
const session = require('express-session');

app.use(cookieParser());

app.use(session({
  name: process.env.SESSION_NAME || 'awtc.sid',
  secret: process.env.SESSION_SECRET || 'awtc_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    // secure: process.env.NODE_ENV === 'production',
    secure: false, // Set to false for local testing over HTTP
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 //1 day
  }
}));

const db = require("./models");

db.sequelize
  .sync({ force: false })
  .then(() => console.log("Database synced without dropping data!"))
  .catch((err) => console.error("DB Error:", err.message));

  //Log available models to help debug dashboard data loading
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

// Debug route to check messages
app.get('/debug-messages', async (req, res) => {
  try {
    const messages = await db.Message.findAll({
      include: [
        { model: db.User, as: 'sender', attributes: ['id', 'name', 'email'] },
        { model: db.User, as: 'receiver', attributes: ['id', 'name', 'email'] }
      ]
    });
    
    const [counts] = await db.sequelize.query(
      `SELECT senderId, COUNT(*) as count FROM \`Messages\` GROUP BY senderId`
    );
    
    res.json({
      totalMessages: messages.length,
      messages: messages,
      countsBySender: counts
    });
  } catch (err) {
    res.json({ error: err.message, stack: err.stack });
  }
});

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
  })
  .catch((err) => console.error("DB Error: " + err.message));

// Load API Routes
const projectRoutes = require("./routes/project.routes");
const reviewRoutes = require("./routes/reviews.routes");
const categoryRoutes = require("./routes/category.routes");
const userRoutes = require("./routes/user.routes");
const contactRoutes = require("./routes/contact.routes");
const sessionRoutes = require("./routes/session.routes");
const externalRoutes = require("./routes/external.routes");
const messageRoutes = require("./routes/message.routes");
const subscriptionRoutes = require("./routes/subscription.routes");

app.use("/api/projects", projectRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/external", externalRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use('/', sessionRoutes);

// Simple EJS dashboard routes (demo)
// Helper to gather dashboard data used by multiple routes
async function getDashboardData() {
  const projects = (await safeFindAll(db.Project)) || [];
  const users = (await safeFindAll(db.User)) || [];
  const categories = (await safeFindAll(db.Category)) || [];
  
  // Load reviews with their associated users
  let reviews = [];
  try {
    reviews = await db.Reviews.findAll({
      include: [{ model: db.User, as: 'user', attributes: ['id', 'email', 'name', 'role'] }]
    });
  } catch (err) {
    console.warn('Could not load reviews with users:', err.message);
    reviews = (await safeFindAll(db.Reviews)) || [];
  }
  
  // Load message counts per user
  let messageCountsPerUser = {};
  try {
    if (db.Message) {
      // First, check if there are any messages in the database
      const allMessages = await db.Message.findAll();
      console.log('Total messages in database:', allMessages.length);
      
      const [messageCounts] = await db.sequelize.query(
        `SELECT senderId as userId, COUNT(*) as messageCount
         FROM \`Messages\`
         GROUP BY senderId`
      );
      console.log('Message counts per user (raw query):', messageCounts);
      messageCounts.forEach(row => {
        messageCountsPerUser[row.userId] = parseInt(row.messageCount) || 0;
      });
      console.log('Message counts map:', messageCountsPerUser);
    } else {
      console.warn('Message model not available');
    }
  } catch (err) {
    console.warn('Could not load message counts:', err.message, err.stack);
  }
  
  // Add message counts to reviews
  reviews = reviews.map(review => {
    const reviewData = review.toJSON ? review.toJSON() : review;
    const userId = reviewData.user?.id;
    const msgCount = messageCountsPerUser[userId] || 0;
    console.log(`Review user ID: ${userId}, messageCount from map: ${msgCount}`);
    return {
      ...reviewData,
      messageCount: msgCount
    };
  });
  console.log('Final reviews with message counts:', reviews.map(r => ({ userId: r.user?.id, messageCount: r.messageCount, userName: r.user?.name })));
  
  const contacts = db.Contact ? (await safeFindAll(db.Contact)) : [];

  const recent = (arr, n = 5) => {
    if (!Array.isArray(arr)) return [];
    const copy = arr.slice();
    copy.sort((a,b) => {
      const aDate = a && (a.createdAt || a.created_at || a.date) ? new Date(a.createdAt || a.created_at || a.date) : null;
      const bDate = b && (b.createdAt || b.created_at || b.date) ? new Date(b.CreatedAt || b.created_at || b.date) : null;
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

      // Get projects per user (how many projects each user is registered in)
      try {
        const [projectsPerUser] = await db.sequelize.query(
          `SELECT u.id as userId, u.name as userName, u.email, COUNT(up.projectId) as projectCount
           FROM \`Users\` u
           LEFT JOIN \`UserProjects\` up ON up.userId = u.id
           GROUP BY u.id, u.name, u.email
           ORDER BY projectCount DESC`
        );
        result.projectsPerUser = projectsPerUser;
        
        // Also get all UserProjects for frontend
        const allUserProjects = await db.UserProject.findAll({
          attributes: ['userId', 'projectId', 'status', 'role', 'createdAt', 'updatedAt']
        });
        result.allUserProjects = allUserProjects;
      } catch (err) {
        console.warn('Could not compute projectsPerUser:', err.message);
        result.projectsPerUser = null;
        result.allUserProjects = [];
      }
    }
  } catch (err) {
    console.warn('Could not compute usersPerProject or projectsWithVolunteers:', err.message);
    result.usersPerProject = null;
    result.projectsWithVolunteers = null;
    result.projectsPerUser = null;
  }

  return result;
}

// Render dashboard with specified section
async function renderDashboard(req, res, section = 'overview') {
  if (!req.user) return res.redirect('/login');
  if (req.user.role !== 'admin') {
    return res.status(403).render('access-denied', { currentUser: req.user, frontendUrl: FRONTEND_URL });
  }
  try {
    const data = await getDashboardData();
    console.log(`Dashboard counts -> projects: ${data.projects.length}, users: ${data.users.length}, categories: ${data.categories.length}, reviews: ${data.reviews.length}`);
    console.log(`Section: ${section}, latestProjects: ${data.latestProjects?.length}, latestUsers: ${data.latestUsers?.length}`);
    console.log(`ProjectsPerUser data:`, data.projectsPerUser ? `${data.projectsPerUser.length} users` : 'null');
    console.log('Reviews before render:', JSON.stringify(data.reviews.map(r => ({ userId: r.user?.id, messageCount: r.messageCount }))));
    // compute current user's registrations and bans if any
    const userRegisteredProjectIds = req.user ? (await db.UserProject.findAll({ where: { userId: req.user.id } })).map(r => r.projectId) : [];
    const userBannedProjectIds = req.user ? (await db.UserProjectBan.findAll({ where: { userId: req.user.id } })).map(b => b.projectId) : [];

    res.render('index', Object.assign({
      shopName: 'A Will To Change',
      currentUser: req.user || null,
      currentSection: section,
      frontendUrl: FRONTEND_URL,
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
      currentSection: section,
      frontendUrl: FRONTEND_URL
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
app.get('/overview', (req, res) => renderDashboard(req, res, 'overview'));
app.get('/users', (req, res) => renderDashboard(req, res, 'users'));
app.get('/categories', (req, res) => renderDashboard(req, res, 'categories'));
app.get('/reviews', (req, res) => renderDashboard(req, res, 'reviews'));
app.get('/contacts', (req, res) => renderDashboard(req, res, 'contacts'));


const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

app.use((req, res, next) => {
  // Skip frontend serving for API routes, debug routes, and dashboard routes
  if (req.path.startsWith("/api") || 
      req.path.startsWith("/debug") || 
      req.path === "/login" || 
      req.path === "/logout" ||
      req.path === "/" ||
      req.path === "/overview" ||
      req.path === "/projects" ||
      req.path === "/users" ||
      req.path === "/categories" ||
      req.path === "/reviews" ||
      req.path === "/contacts") {
    return next();
  }
  res.sendFile(path.join(frontendPath, "index.html"));
});

const PORT = process.env.PORT || 8080;
const HTTPS_PORT = process.env.HTTPS_PORT || 8443;
const USE_HTTPS = process.env.USE_HTTPS === 'true';

// Create HTTP or HTTPS server
const http = require('http');
const https = require('https');
const fs = require('fs');

let server;

if (USE_HTTPS) {
  // Try to load SSL certificates
  const sslKeyPath = path.join(__dirname, 'ssl', 'key.pem');
  const sslCertPath = path.join(__dirname, 'ssl', 'cert.pem');
  
  if (fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
    const httpsOptions = {
      key: fs.readFileSync(sslKeyPath),
      cert: fs.readFileSync(sslCertPath)
    };
    
    // Create HTTPS server
    const httpsServer = https.createServer(httpsOptions, app);
    
    // Create HTTP server (without redirect, serve the app directly)
    const httpServer = http.createServer(app);
    
    // Initialize Socket.IO on HTTPS server (primary)
    const { initializeSocketIO } = require('./config/socket');
    initializeSocketIO(httpsServer);
    
    // Start both servers
    httpServer.listen(PORT, () => {
      console.log(`🌐 HTTP server running on http://localhost:${PORT}`);
    });
    
    httpsServer.listen(HTTPS_PORT, () => {
      console.log(`🔐 HTTPS server running on https://localhost:${HTTPS_PORT}`);
      console.log(`📚 Swagger docs available at https://localhost:${HTTPS_PORT}/api-docs`);
      console.log(`💬 WebSocket server initialized for messaging`);
    });
    
    console.log('✅ Dual mode: Both HTTP and HTTPS servers running');
    console.log('   - HTTP (for push notifications): http://localhost:8080');
    console.log('   - HTTPS (for secure features): https://localhost:8443');
    
  } else {
    console.warn('⚠️  SSL certificates not found. Run: node scripts/generate-ssl-cert.js');
    console.warn('   Falling back to HTTP mode...');
    
    server = http.createServer(app);
    
    // Initialize Socket.IO
    const { initializeSocketIO } = require('./config/socket');
    initializeSocketIO(server);
    
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
      console.log(`WebSocket server initialized for messaging`);
    });
  }
} else {
  server = http.createServer(app);
  
  // Initialize Socket.IO
  const { initializeSocketIO } = require('./config/socket');
  initializeSocketIO(server);
  
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
    console.log(`WebSocket server initialized for messaging`);
  });
}