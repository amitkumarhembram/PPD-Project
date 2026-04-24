const express = require('express');
const ApplicationController = require('../controllers/applicationController');
const { verifyStudent } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.put('/me', verifyStudent, ApplicationController.updateProfile);
router.post('/submit', verifyStudent, ApplicationController.submitForVerification);
router.get('/me', verifyStudent, ApplicationController.getStatus);
router.get('/me/full', verifyStudent, ApplicationController.getFullData);
router.post('/photo', verifyStudent, upload.single('photo'), ApplicationController.uploadPhoto);

module.exports = router;

