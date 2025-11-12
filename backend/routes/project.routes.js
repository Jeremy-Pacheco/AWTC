const express = require('express');
const router = express.Router();
const upload = require('../multer/upload');
const projectController = require('../controllers/project.controller');

router.post('/', upload.single('file'), projectController.createProject);
router.get('/', projectController.getAllProjects);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;