const express = require('express');
const AdminController = require('../controllers/adminController');
const { verifyAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/applications', verifyAdmin, AdminController.getApplications);
router.post('/verify/:studentId', verifyAdmin, AdminController.verifyStudent);
router.get('/stats', verifyAdmin, AdminController.getStats);

router.post('/register', verifyAdmin, AdminController.registerAdmin);
router.get('/list', verifyAdmin, AdminController.getAdmins);
router.put('/:id', verifyAdmin, AdminController.updateAdmin);
router.delete('/:id', verifyAdmin, AdminController.deleteAdmin);

router.get('/students', verifyAdmin, AdminController.getStudents);
router.get('/students/:id', verifyAdmin, AdminController.getStudentFull);
router.put('/students/:id', verifyAdmin, AdminController.updateStudent);
router.delete('/students/:id', verifyAdmin, AdminController.deleteStudent);

// Academic Management
router.get('/programs', verifyAdmin, AdminController.getPrograms);
router.post('/programs', verifyAdmin, AdminController.createProgram);
router.put('/programs/:id', verifyAdmin, AdminController.updateProgram);
router.delete('/programs/:id', verifyAdmin, AdminController.deleteProgram);

router.get('/branches', verifyAdmin, AdminController.getBranches);
router.post('/branches', verifyAdmin, AdminController.createBranch);
router.put('/branches/:id', verifyAdmin, AdminController.updateBranch);
router.delete('/branches/:id', verifyAdmin, AdminController.deleteBranch);

// Subject & Curriculum Management
const SubjectController = require('../controllers/subjectController');
router.get('/subjects', verifyAdmin, SubjectController.getAllSubjects);
router.post('/subjects', verifyAdmin, SubjectController.createSubject);

router.get('/curriculum', verifyAdmin, SubjectController.getMappedSubjects);
router.post('/curriculum', verifyAdmin, SubjectController.assignSubjectToBranch);
router.delete('/curriculum/:mappingId', verifyAdmin, SubjectController.removeSubjectFromBranch);

module.exports = router;
