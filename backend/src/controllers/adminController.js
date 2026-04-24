const AdminService = require('../services/adminService');
const AuthService = require('../services/authService');

class AdminController {
    static async getApplications(req, res) {
        try {
            const { status, page = 1, limit = 20 } = req.query;
            const result = await AdminService.getApplications(status, parseInt(page), parseInt(limit));
            res.status(200).json(result);
        } catch (error) { res.status(400).json({ error: error.message }); }
    }

    static async verifyStudent(req, res) {
        try {
            const { studentId } = req.params;
            const { status } = req.body;
            const result = await AdminService.verifyStudent(studentId, status);
            res.status(200).json({ message: 'Status updated', student: result });
        } catch (error) { res.status(400).json({ error: error.message }); }
    }

    static async getStats(req, res) {
        try {
            const data = await AdminService.getStats();
            res.status(200).json(data);
        } catch (error) { res.status(400).json({ error: error.message }); }
    }

    static async registerAdmin(req, res) {
        try {
            if (req.user.adminRole !== 'SUPERADMIN') return res.status(403).json({ error: 'Only SUPERADMIN can register new admins' });
            const data = await AuthService.registerAdmin(req.body);
            res.status(201).json({ message: 'Admin created successfully', data });
        } catch (error) { res.status(400).json({ error: error.message }); }
    }

    static async getAdmins(req, res) {
        try { res.status(200).json(await AdminService.getAdmins()); }
        catch (error) { res.status(400).json({ error: error.message }); }
    }

    static async updateAdmin(req, res) {
        try { res.status(200).json(await AdminService.updateAdmin(req.params.id, req.body)); }
        catch (error) { res.status(400).json({ error: error.message }); }
    }

    static async deleteAdmin(req, res) {
        try { res.status(200).json(await AdminService.deleteAdmin(req.params.id)); }
        catch (error) { res.status(error.status || 400).json({ error: error.message }); }
    }

    static async getStudents(req, res) {
        try { res.status(200).json(await AdminService.getStudents()); }
        catch (error) { res.status(400).json({ error: error.message }); }
    }

    static async getStudentFull(req, res) {
        try { res.status(200).json(await AdminService.getStudentFull(req.params.id)); }
        catch (error) { res.status(error.status || 400).json({ error: error.message }); }
    }

    static async updateStudent(req, res) {
        try { res.status(200).json(await AdminService.updateStudentBasic(req.params.id, req.body)); }
        catch (error) { res.status(error.status || 400).json({ error: error.message }); }
    }

    static async deleteStudent(req, res) {
        try { res.status(200).json(await AdminService.deleteStudent(req.params.id)); }
        catch (error) { res.status(error.status || 400).json({ error: error.message }); }
    }

    static async getEnrollments(req, res) {
        try {
            const { status } = req.query;
            res.status(200).json(await AdminService.getEnrollments(status));
        } catch (error) { res.status(400).json({ error: error.message }); }
    }

    static async updateEnrollmentStatus(req, res) {
        try {
            res.status(200).json(await AdminService.updateEnrollmentStatus(req.params.id, req.body.status));
        } catch (error) { res.status(error.status || 400).json({ error: error.message }); }
    }

    static async getPrograms(req, res) {
        try { res.status(200).json(await AdminService.getPrograms()); }
        catch (error) { res.status(400).json({ error: error.message }); }
    }
    static async createProgram(req, res) {
        try { res.status(201).json(await AdminService.createProgram(req.body)); }
        catch (error) { res.status(400).json({ error: error.message }); }
    }
    static async updateProgram(req, res) {
        try { res.status(200).json(await AdminService.updateProgram(req.params.id, req.body)); }
        catch (error) { res.status(400).json({ error: error.message }); }
    }
    static async deleteProgram(req, res) {
        try { res.status(200).json(await AdminService.deleteProgram(req.params.id)); }
        catch (error) { res.status(400).json({ error: error.message }); }
    }

    static async getBranches(req, res) {
        try { res.status(200).json(await AdminService.getBranches()); }
        catch (error) { res.status(400).json({ error: error.message }); }
    }
    static async createBranch(req, res) {
        try { res.status(201).json(await AdminService.createBranch(req.body)); }
        catch (error) { res.status(400).json({ error: error.message }); }
    }
    static async updateBranch(req, res) {
        try { res.status(200).json(await AdminService.updateBranch(req.params.id, req.body)); }
        catch (error) { res.status(400).json({ error: error.message }); }
    }
    static async deleteBranch(req, res) {
        try { res.status(200).json(await AdminService.deleteBranch(req.params.id)); }
        catch (error) { res.status(400).json({ error: error.message }); }
    }
}

module.exports = AdminController;
