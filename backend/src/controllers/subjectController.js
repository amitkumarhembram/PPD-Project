const SubjectService = require('../services/subjectService');

class SubjectController {
    // --- CATALOG ---
    static async getAllSubjects(req, res) {
        try {
            const data = await SubjectService.getAllSubjects();
            res.status(200).json(data);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async createSubject(req, res) {
        try {
            const { code, name, credits } = req.body;
            if (!code || !name) {
                return res.status(400).json({ error: "Code and name are required." });
            }
            const data = await SubjectService.createSubject({ code, name, credits });
            res.status(201).json({ message: 'Subject created', data });
        } catch (error) {
            // Check for duplicate code (unique constraint)
            if (error.code === '23505') {
                return res.status(409).json({ error: 'Subject code already exists.' });
            }
            res.status(400).json({ error: error.message });
        }
    }

    // --- MAPPING ---
    static async getMappedSubjects(req, res) {
        try {
            const { branchId, semester } = req.query;
            const data = await SubjectService.getMappedSubjects(branchId, semester);
            res.status(200).json(data);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async assignSubjectToBranch(req, res) {
        try {
            const { branch_id, subject_id, semester } = req.body;
            if (!branch_id || !subject_id || !semester) {
                return res.status(400).json({ error: "branch_id, subject_id, and semester are required." });
            }
            const data = await SubjectService.assignSubjectToBranch(branch_id, subject_id, semester);
            res.status(201).json({ message: 'Subject assigned to branch', data });
        } catch (error) {
            if (error.message.includes('already assigned')) {
                return res.status(409).json({ error: error.message });
            }
            res.status(400).json({ error: error.message });
        }
    }

    static async removeSubjectFromBranch(req, res) {
        try {
            const { mappingId } = req.params;
            const data = await SubjectService.removeSubjectFromBranch(mappingId);
            res.status(200).json({ message: 'Mapping removed', data });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // --- STUDENT ---
    static async getStudentSubjects(req, res) {
        try {
            const studentId = req.user.id;
            const data = await SubjectService.getStudentSubjects(studentId);
            res.status(200).json(data);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = SubjectController;
