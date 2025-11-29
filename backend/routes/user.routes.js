const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middlewares');
const multerUpload = require('../multer/upload');

const { isAdmin, isAdminOrCoordinator } = require('../middlewares/role.middlewares');

const upload = require('../multer/upload');

const requireAuth = require('../middlewares/requireAuth');

/**
 * @swagger
 * /api/users/dashboard:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Profile updated
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/dashboard',
  authMiddleware,
  requireAuth,
  upload.single('file'),
  userCtrl.updateOwnProfile
);

router.get(
  '/dashboard',
  authMiddleware,
  requireAuth,
  userCtrl.getOwnProfile
);

// Delete own account
router.delete('/dashboard', authMiddleware, requireAuth, userCtrl.deleteOwnProfile);

// Get projects for current user (dashboard)
router.get('/dashboard/projects', authMiddleware, requireAuth, userCtrl.getOwnProjects);

// Admin or coordinator can list another user's projects
router.get('/:id/projects', authMiddleware, isAdminOrCoordinator, userCtrl.getUserProjects);
// Get bans for specific user (admin or coordinator)
router.get('/:id/bans', authMiddleware, isAdminOrCoordinator, userCtrl.getUserBans);

/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */
router.post('/signup', userCtrl.createUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns token
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', userCtrl.login);

/**
 * @swagger
 * /api/users/coordinator:
 *   post:
 *     summary: Create a new coordinator (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Coordinator created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/coordinator', authMiddleware, isAdmin, userCtrl.createCoordinator);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (admin or coordinator only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', authMiddleware, isAdminOrCoordinator, userCtrl.getUsers);

/**
 * @swagger
 * /api/users/{id}/role:
 *   put:
 *     summary: Update user role (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin, coordinator]
 *     responses:
 *       200:
 *         description: Role updated
 *       401:
 *         description: Unauthorized
 */
router.put('/:id/role', authMiddleware, isAdmin, userCtrl.updateUserRole);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', authMiddleware, isAdmin, userCtrl.deleteUser);

module.exports = router;
