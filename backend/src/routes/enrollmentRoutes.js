const express = require('express');
const EnrollmentController = require('../controllers/enrollmentController');
const { verifyStudent } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/programs', EnrollmentController.getPrograms);
router.get('/programs/:programId/branches', EnrollmentController.getBranches);

router.post('/enrollment', verifyStudent, EnrollmentController.enroll);
router.get('/enrollment/me', verifyStudent, EnrollmentController.getMyEnrollment);

const SubjectController = require('../controllers/subjectController');
router.get('/student/subjects', verifyStudent, SubjectController.getStudentSubjects);

module.exports = router;
