const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middlewares'); // <-- asegurarse que el archivo exista

router.post('/signup', userCtrl.createUser);
router.post('/login', userCtrl.login);

router.post('/coordinator', authMiddleware, userCtrl.createCoordinator);
router.get('/', authMiddleware, userCtrl.getUsers);
router.put('/:id/role', authMiddleware, userCtrl.updateUserRole);
router.delete('/:id', authMiddleware, userCtrl.deleteUser);

module.exports = router;
