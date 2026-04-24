const express = require('express');
const DocumentController = require('../controllers/documentController');
const { verifyStudent } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.post('/', verifyStudent, upload.single('file'), DocumentController.upload);
router.get('/me', verifyStudent, DocumentController.getMyDocuments);

module.exports = router;

