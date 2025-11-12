const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middlewares');

const { isAdmin, isAdminOrCoordinator } = require('../middlewares/role.middlewares');

router.post('/signup', userCtrl.createUser);
router.post('/login', userCtrl.login);

router.post('/coordinator', authMiddleware, isAdmin, userCtrl.createCoordinator);

router.get('/', authMiddleware, isAdminOrCoordinator, userCtrl.getUsers);

router.put('/:id/role', authMiddleware, isAdmin, userCtrl.updateUserRole);

router.delete('/:id', authMiddleware, isAdmin, userCtrl.deleteUser);

module.exports = router;
