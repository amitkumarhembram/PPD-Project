const AdminService = require('../services/adminService');
const AuthService = require('../services/authService');

class AdminController {
    static async getApplications(req, res) {
        try {
            const { status, page = 1, limit = 20 } = req.query;
            const result = await AdminService.getApplications(status, parseInt(page), parseInt(limit));
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async verifyStudent(req, res) {
        try {
            const { studentId } = req.params;
            const { status } = req.body;
            const result = await AdminService.verifyStudent(studentId, status);
            res.status(200).json({ message: 'Status updated', student: result });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async getStats(req, res) {
        try {
            const data = await AdminService.getStats();
            res.status(200).json(data);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // Admins
    static async registerAdmin(req, res) {
        try {
            if (req.user.adminRole !== 'SUPERADMIN') {
                return res.status(403).json({ error: 'Only SUPERADMIN can register new admins' });
            }
            const data = await AuthService.registerAdmin(req.body);
            res.status(201).json({ message: 'Admin created successfully', data });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async getAdmins(req, res) {
        try {
            const data = await AdminService.getAdmins();
            res.status(200).json(data);
        } catch (error) { res.status(400).json({ error: error.message }); }
    }

    static async updateAdmin(req, res) {
        try {
            const data = await AdminService.updateAdmin(req.params.id, req.body);
            res.status(200).json(data);
        } catch (error) { res.status(400).json({ error: error.message }); }
    }

    static async deleteAdmin(req, res) {
        try {
            const data = await AdminService.deleteAdmin(req.params.id);
            res.status(200).json(data);
        } catch (error) { 
            const status = error.status || 400;
            res.status(status).json({ error: error.message }); 
        }
    }

    // Students
    static async getStudents(req, res) {
        try {
            const data = await AdminService.getStudents();
            res.status(200).json(data);
        } catch (error) { res.status(400).json({ error: error.message }); }
    }

    static async getStudentFull(req, res) {
        try {
            const data = await AdminService.getStudentFull(req.params.id);
            res.status(200).json(data);
        } catch (error) { 
            const status = error.status || 400;
            res.status(status).json({ error: error.message }); 
        }
    }

    static async updateStudent(req, res) {
        try {
            const data = await AdminService.updateStudentBasic(req.params.id, req.body);
            res.status(200).json(data);
        } catch (error) { 
            const status = error.status || 400;
            res.status(status).json({ error: error.message }); 
        }
    }

    static async deleteStudent(req, res) {
        try {
            const data = await AdminService.deleteStudent(req.params.id);
            res.status(200).json(data);
        } catch (error) { 
            const status = error.status || 400;
            res.status(status).json({ error: error.message }); 
        }
    }
    // Academic Management - Programs
    static async getPrograms(req, res) {
        try {
            const data = await AdminService.getPrograms();
            res.status(200).json(data);
        } catch (error) { res.status(400).json({ error: error.message }); }
    }

    static async createProgram(req, res) {
        try {
            const data = await AdminService.createProgram(req.body);
            res.status(201).json(data);
        } catch (error) { res.status(400).json({ error: error.message }); }
    }

    static async updateProgram(req, res) {
        try {
            const data = await AdminService.updateProgram(req.params.id, req.body);
            res.status(200).json(data);
        } catch (error) { res.status(400).json({ error: error.message }); }
    }

    static async deleteProgram(req, res) {
        try {
            const data = await AdminService.deleteProgram(req.params.id);
            res.status(200).json(data);
        } catch (error) { res.status(400).json({ error: error.message }); }
    }

    // Academic Management - Branches
    static async getBranches(req, res) {
        try {
            const data = await AdminService.getBranches();
            res.status(200).json(data);
        } catch (error) { res.status(400).json({ error: error.message }); }
    }

    static async createBranch(req, res) {
        try {
            const data = await AdminService.createBranch(req.body);
            res.status(201).json(data);
        } catch (error) { res.status(400).json({ error: error.message }); }
    }

    static async updateBranch(req, res) {
        try {
            const data = await AdminService.updateBranch(req.params.id, req.body);
            res.status(200).json(data);
        } catch (error) { res.status(400).json({ error: error.message }); }
    }

    static async deleteBranch(req, res) {
        try {
            const data = await AdminService.deleteBranch(req.params.id);
            res.status(200).json(data);
        } catch (error) { res.status(400).json({ error: error.message }); }
    }
}

module.exports = AdminController;
