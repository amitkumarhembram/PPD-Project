const EnrollmentService = require('../services/enrollmentService');

class EnrollmentController {
    static async getPrograms(req, res) {
        try {
            const data = await EnrollmentService.getPrograms();
            res.status(200).json(data);
        } catch (error) { res.status(400).json({ error: error.message }); }
    }

    static async getBranches(req, res) {
        try {
            const data = await EnrollmentService.getBranches(req.params.programId);
            res.status(200).json(data);
        } catch (error) { res.status(400).json({ error: error.message }); }
    }

    static async enroll(req, res) {
        try {
            const { branch_id } = req.body;
            const data = await EnrollmentService.enrollStudent(req.user.id, branch_id);
            res.status(201).json({ message: 'Enrollment requested', status: 'PENDING', data });
        } catch (error) { 
            const status = error.status || 400;
            res.status(status).json({ error: error.message }); 
        }
    }

    static async getMyEnrollment(req, res) {
        try {
            const data = await EnrollmentService.getMyEnrollment(req.user.id);
            if (!data) return res.status(200).json(null);
            res.status(200).json(data);
        } catch (error) { res.status(400).json({ error: error.message }); }
    }
}

module.exports = EnrollmentController;
