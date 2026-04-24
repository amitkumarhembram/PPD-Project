const db = require('../config/db');

class AdminService {
    static async getApplications(status, page = 1, limit = 20) {
        let queryStr = `
            SELECT s.id, s.name, s.email, s.phone, s.dob, s.gender, s.aadhar_number, s.highest_qualification, s.status, s.created_at,
                   a.class10_percentage, a.class12_percentage, a.ug_percentage
            FROM student s
            LEFT JOIN academic_details a ON s.id = a.student_id
        `;
        let countQueryStr = `SELECT COUNT(*) FROM student s`;
        
        const params = [];

        if (status) {
            queryStr += ` WHERE s.status = $1`;
            countQueryStr += ` WHERE s.status = $1`;
            params.push(status);
        } else {
            queryStr += ` WHERE s.status IN ('SUBMITTED', 'VERIFIED', 'REJECTED')`;
            countQueryStr += ` WHERE s.status IN ('SUBMITTED', 'VERIFIED', 'REJECTED')`;
        }

        queryStr += ` ORDER BY s.created_at DESC`;

        const offset = (page - 1) * limit;
        queryStr += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        
        const dataParams = [...params, limit, offset];

        const [dataResult, countResult] = await Promise.all([
            db.query(queryStr, dataParams),
            db.query(countQueryStr, params)
        ]);

        return {
            page: Number(page),
            limit: Number(limit),
            total: Number(countResult.rows[0].count),
            data: dataResult.rows
        };
    }

    static async verifyStudent(studentId, status) {
        if (status !== 'VERIFIED' && status !== 'REJECTED') {
            throw new Error(`Invalid status. Must be 'VERIFIED' or 'REJECTED'.`);
        }

        const query = `
            UPDATE student SET status = $1 WHERE id = $2 RETURNING id, status
        `;
        const result = await db.query(query, [status, studentId]);
        
        if (result.rowCount === 0) {
            throw new Error('Student not found');
        }
        
        return result.rows[0];
    }

    static async getStats() {
        const queries = [
            db.query("SELECT COUNT(*) FROM student WHERE status != 'DRAFT'"),
            db.query("SELECT COUNT(*) FROM student WHERE status = 'SUBMITTED'"),
            db.query("SELECT COUNT(*) FROM student WHERE status = 'ENROLLED'"),
            db.query('SELECT status, COUNT(*) as count FROM student GROUP BY status'),
            db.query(`
                SELECT b.name as branch_name, b.capacity, COUNT(e.id) as enrolled
                FROM branch b
                LEFT JOIN enrollment e ON b.id = e.branch_id AND e.status IN ('PENDING', 'APPROVED')
                GROUP BY b.id, b.name, b.capacity
                ORDER BY b.name
            `),
            db.query(`SELECT DATE(created_at) as date, COUNT(*) as count FROM student GROUP BY DATE(created_at) ORDER BY date ASC`),
            db.query(`SELECT id, name, email, created_at FROM student WHERE status = 'SUBMITTED' ORDER BY created_at DESC LIMIT 5`)
        ];

        const [totalRes, pendingRes, enrolledRes, breakdownRes, branchRes, timeRes, attentionRes] = await Promise.all(queries);

        const breakdown = {
            DRAFT: 0,
            SUBMITTED: 0,
            VERIFIED: 0,
            REJECTED: 0,
            ENROLLED: 0
        };

        breakdownRes.rows.forEach(row => {
            breakdown[row.status] = Number(row.count);
        });

        const branch_enrollments = branchRes.rows.map(row => ({
            branch_name: row.branch_name,
            capacity: Number(row.capacity),
            enrolled: Number(row.enrolled)
        }));

        const registrations_over_time = timeRes.rows.map(row => ({
            date: row.date,
            count: Number(row.count)
        }));

        const needs_attention = attentionRes.rows.map(row => ({
            id: row.id,
            name: row.name,
            email: row.email,
            submitted_at: row.created_at
        }));

        return {
            total_applications: Number(totalRes.rows[0].count),
            pending_verifications: Number(pendingRes.rows[0].count),
            total_enrolled: Number(enrolledRes.rows[0].count),
            application_status_breakdown: breakdown,
            branch_enrollments,
            registrations_over_time,
            needs_attention
        };
    }

    static async getAdmins() {
        const query = `SELECT id, name, email, role, created_at FROM admin ORDER BY created_at DESC`;
        const result = await db.query(query);
        return result.rows;
    }

    static async updateAdmin(id, { name, role }) {
        const adminRes = await db.query('SELECT role FROM admin WHERE id = $1', [id]);
        if (adminRes.rowCount === 0) throw new Error('Admin not found');
        if (adminRes.rows[0].role === 'SUPERADMIN') {
            const err = new Error('Cannot edit a SUPERADMIN');
            err.status = 403;
            throw err;
        }

        const query = `UPDATE admin SET name = COALESCE($1, name), role = COALESCE($2, role) WHERE id = $3 RETURNING id, name, email, role`;
        const result = await db.query(query, [name, role, id]);
        return result.rows[0];
    }

    static async deleteAdmin(id) {
        const adminRes = await db.query('SELECT role FROM admin WHERE id = $1', [id]);
        if (adminRes.rowCount === 0) {
            const err = new Error('Admin not found');
            err.status = 404;
            throw err;
        }
        if (adminRes.rows[0].role === 'SUPERADMIN') {
            const err = new Error('Cannot delete a SUPERADMIN');
            err.status = 403;
            throw err;
        }
        await db.query('DELETE FROM admin WHERE id = $1', [id]);
        return { message: 'Admin deleted' };
    }

    static async getStudents() {
        const query = `
            SELECT s.id, s.name, s.email, s.status, s.created_at,
                   e.branch_id, b.name as branch_name, p.name as program_name
            FROM student s
            LEFT JOIN enrollment e ON s.id = e.student_id
            LEFT JOIN branch b ON e.branch_id = b.id
            LEFT JOIN program p ON b.program_id = p.id
            WHERE s.status = 'ENROLLED'
            ORDER BY s.created_at DESC
        `;
        const result = await db.query(query);
        return result.rows;
    }

    static async getStudentFull(id) {
        const student = await db.query(`SELECT * FROM student WHERE id = $1`, [id]);
        if (student.rowCount === 0) {
            const err = new Error('Student not found');
            err.status = 404;
            throw err;
        }
        
        const [addresses, families, academics, docs] = await Promise.all([
            db.query('SELECT * FROM address WHERE student_id = $1', [id]),
            db.query('SELECT * FROM family_details WHERE student_id = $1', [id]),
            db.query('SELECT * FROM academic_details WHERE student_id = $1', [id]),
            db.query('SELECT * FROM documents WHERE student_id = $1', [id])
        ]);

        return {
            ...student.rows[0],
            address: addresses.rows[0] || null,
            family_details: families.rows[0] || null,
            academic_details: academics.rows[0] || null,
            documents: docs.rows
        };
    }

    static async updateStudentBasic(id, updates) {
        const { phone, dob, aadhar_number, gender } = updates;
        const query = `
            UPDATE student 
            SET phone = COALESCE($1, phone), 
                dob = COALESCE($2, dob), 
                aadhar_number = COALESCE($3, aadhar_number), 
                gender = COALESCE($4, gender)
            WHERE id = $5 
            RETURNING *`;
        const result = await db.query(query, [phone, dob, aadhar_number, gender, id]);
        if (result.rowCount === 0) {
            const err = new Error('Student not found');
            err.status = 404;
            throw err;
        }
        return result.rows[0];
    }

    static async deleteStudent(id) {
        const studentRes = await db.query('SELECT status FROM student WHERE id = $1', [id]);
        if (studentRes.rowCount === 0) {
            const err = new Error('Student not found');
            err.status = 404;
            throw err;
        }
        if (studentRes.rows[0].status === 'ENROLLED') {
            const err = new Error('Cannot delete an ENROLLED student');
            err.status = 403;
            throw err;
        }
        
        const result = await db.query('DELETE FROM student WHERE id = $1', [id]);
        return { message: 'Student and related records deleted' };
    }

    // --- Programs ---
    static async getPrograms() {
        const query = `
            SELECT p.id, p.name, l.name as level_name, p.level_id
            FROM program p
            JOIN level l ON p.level_id = l.id
            ORDER BY p.name ASC
        `;
        const result = await db.query(query);
        return result.rows;
    }

    static async createProgram({ name, level_id }) {
        const query = `INSERT INTO program (name, level_id) VALUES ($1, $2) RETURNING *`;
        const result = await db.query(query, [name, level_id]);
        return result.rows[0];
    }

    static async updateProgram(id, { name, level_id }) {
        const query = `UPDATE program SET name = COALESCE($1, name), level_id = COALESCE($2, level_id) WHERE id = $3 RETURNING *`;
        const result = await db.query(query, [name, level_id, id]);
        if (result.rowCount === 0) throw new Error('Program not found');
        return result.rows[0];
    }

    static async deleteProgram(id) {
        const result = await db.query(`DELETE FROM program WHERE id = $1 RETURNING *`, [id]);
        if (result.rowCount === 0) throw new Error('Program not found');
        return { message: 'Program deleted' };
    }

    // --- Branches ---
    static async getBranches() {
        const query = `
            SELECT b.id, b.name, b.capacity, b.program_id, p.name as program_name, l.name as level_name
            FROM branch b
            JOIN program p ON b.program_id = p.id
            JOIN level l ON p.level_id = l.id
            ORDER BY b.name ASC
        `;
        const result = await db.query(query);
        return result.rows;
    }

    static async createBranch({ name, program_id, capacity }) {
        const query = `INSERT INTO branch (name, program_id, capacity) VALUES ($1, $2, $3) RETURNING *`;
        const result = await db.query(query, [name, program_id, capacity]);
        return result.rows[0];
    }

    static async updateBranch(id, { name, program_id, capacity }) {
        const query = `UPDATE branch SET name = COALESCE($1, name), program_id = COALESCE($2, program_id), capacity = COALESCE($3, capacity) WHERE id = $4 RETURNING *`;
        const result = await db.query(query, [name, program_id, capacity, id]);
        if (result.rowCount === 0) throw new Error('Branch not found');
        return result.rows[0];
    }

    static async deleteBranch(id) {
        const result = await db.query(`DELETE FROM branch WHERE id = $1 RETURNING *`, [id]);
        if (result.rowCount === 0) throw new Error('Branch not found');
        return { message: 'Branch deleted' };
    }
}

module.exports = AdminService;
