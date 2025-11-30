const express = require('express');
const router = express.Router();
const upload = require('../multer/upload');
const projectController = require('../controllers/project.controller');
const requireAuth = require('../middlewares/requireAuth');
const authMiddleware = require('../middlewares/auth.middlewares');
const roleMid = require('../middlewares/role.middlewares');

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Bad request
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: List of all projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 */
// Only coordinators or admins can create projects
router.post('/', authMiddleware, roleMid.isAdminOrCoordinator, upload.single('file'), projectController.createProject);
router.get('/', projectController.getAllProjects);

/**
 * @swagger
 * /api/projects/{id}/register:
 *   post:
 *     summary: Register current user to a project
 *     tags: [Projects]
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
 *         description: User registered to project
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */
router.post('/:id/register', requireAuth, projectController.registerUser);

/**
 * @swagger
 * /api/projects/{id}/unregister:
 *   post:
 *     summary: Unregister user from a project
 *     tags: [Projects]
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
 *         description: User unregistered from project
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */
router.post('/:id/unregister', requireAuth, projectController.unregisterUser);

/**
 * @swagger
 * /api/projects/{id}/volunteers:
 *   get:
 *     summary: Get volunteers for a project
 *     tags: [Projects]
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
 *         description: List of volunteers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/volunteers', roleMid.isAdminOrCoordinator, projectController.getVolunteers);

/**
 * @swagger
 * /api/projects/{id}/volunteers/{userId}/accept:
 *   post:
 *     summary: Accept a volunteer registration
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Volunteer accepted
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/volunteers/:userId/accept', roleMid.isAdminOrCoordinator, projectController.acceptVolunteer);

/**
 * @swagger
 * /api/projects/{id}/volunteers/{userId}/reject:
 *   post:
 *     summary: Reject a volunteer registration
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Volunteer rejected
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/volunteers/:userId/reject', roleMid.isAdminOrCoordinator, projectController.rejectVolunteer);

/**
 * @swagger
 * /api/projects/{id}/volunteers/{userId}:
 *   post:
 *     summary: Manually add a volunteer to a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Volunteer added
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/volunteers/:userId', roleMid.isAdminOrCoordinator, projectController.addVolunteer);

/**
 * @swagger
 * /api/projects/{id}/volunteers/{userId}/unban:
 *   post:
 *     summary: Unban a volunteer from a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Volunteer unbanned
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/volunteers/:userId/unban', roleMid.isAdminOrCoordinator, projectController.unbanVolunteer);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: Project updated
 *       404:
 *         description: Project not found
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Project deleted
 *       404:
 *         description: Project not found
 */
router.put('/:id', upload.single('file'), projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;