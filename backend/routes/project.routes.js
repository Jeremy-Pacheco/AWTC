const express = require('express');
const router = express.Router();
const upload = require('../multer/upload');
const projectController = require('../controllers/project.controller');
const requireAuth = require('../middlewares/requireAuth');
const roleMid = require('../middlewares/role.middlewares');

router.post('/', upload.single('file'), projectController.createProject);
router.get('/', projectController.getAllProjects);
// Register current user to a project
router.post('/:id/register', requireAuth, projectController.registerUser);
// User unregister from a project
router.post('/:id/unregister', requireAuth, projectController.unregisterUser);
// Get volunteers for a project
router.get('/:id/volunteers', roleMid.isAdminOrCoordinator, projectController.getVolunteers);
// Accept or reject volunteer registrations
router.post('/:id/volunteers/:userId/accept', roleMid.isAdminOrCoordinator, projectController.acceptVolunteer);
router.post('/:id/volunteers/:userId/reject', roleMid.isAdminOrCoordinator, projectController.rejectVolunteer);
// Admin manually add volunteer (accepted directly)
router.post('/:id/volunteers/:userId', roleMid.isAdminOrCoordinator, projectController.addVolunteer);
// Admin unban a previously banned volunteer
router.post('/:id/volunteers/:userId/unban', roleMid.isAdminOrCoordinator, projectController.unbanVolunteer);
router.put('/:id', upload.single('file'), projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;