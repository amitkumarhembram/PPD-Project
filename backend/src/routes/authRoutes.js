const express = require('express');
const AuthController = require('../controllers/authController');
const { verifyAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

router.post('/admin/register', verifyAdmin, AuthController.registerAdmin);
router.post('/admin/login', AuthController.loginAdmin);

module.exports = router;
