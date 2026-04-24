const db = require('../config/db');

class SubjectService {
    // --- CATALOG (GLOBAL SUBJECTS) ---
    static async getAllSubjects() {
        const query = 'SELECT * FROM subject ORDER BY code ASC';
        const result = await db.query(query);
        return result.rows;
    }

    static async createSubject({ code, name, credits }) {
        const query = `
            INSERT INTO subject (code, name, credits)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const result = await db.query(query, [code, name, credits]);
        return result.rows[0];
    }

    // --- CURRICULUM MAPPING ---
    static async getMappedSubjects(branchId, semester) {
        let query = `
            SELECT bs.id as mapping_id, bs.branch_id, bs.semester, s.*
            FROM branch_subject bs
            JOIN subject s ON bs.subject_id = s.id
            WHERE 1=1
        `;
        const params = [];
        
        if (branchId) {
            params.push(branchId);
            query += ` AND bs.branch_id = $${params.length}`;
        }
        if (semester) {
            params.push(semester);
            query += ` AND bs.semester = $${params.length}`;
        }
        
        query += ' ORDER BY s.code ASC';
        const result = await db.query(query, params);
        return result.rows;
    }

    static async assignSubjectToBranch(branchId, subjectId, semester) {
        // Check if already mapped
        const checkQuery = 'SELECT id FROM branch_subject WHERE branch_id = $1 AND subject_id = $2 AND semester = $3';
        const checkRes = await db.query(checkQuery, [branchId, subjectId, semester]);
        if (checkRes.rowCount > 0) {
            throw new Error('Subject already assigned to this branch for this semester');
        }

        const query = `
            INSERT INTO branch_subject (branch_id, subject_id, semester)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const result = await db.query(query, [branchId, subjectId, semester]);
        return result.rows[0];
    }

    static async removeSubjectFromBranch(mappingId) {
        const query = 'DELETE FROM branch_subject WHERE id = $1 RETURNING *';
        const result = await db.query(query, [mappingId]);
        if (result.rowCount === 0) {
            throw new Error('Mapping not found');
        }
        return result.rows[0];
    }

    // --- STUDENT ---
    static async getStudentSubjects(studentId) {
        // 1. Get student's enrollment branch and current_semester
        const enrollQuery = `
            SELECT branch_id, current_semester 
            FROM enrollment 
            WHERE student_id = $1 AND status = 'APPROVED'
        `;
        const enrollRes = await db.query(enrollQuery, [studentId]);
        
        if (enrollRes.rowCount === 0) {
            return []; // Not enrolled or pending
        }
        
        const { branch_id, current_semester } = enrollRes.rows[0];

        // 2. Fetch subjects for that branch and semester
        const query = `
            SELECT s.* 
            FROM branch_subject bs
            JOIN subject s ON bs.subject_id = s.id
            WHERE bs.branch_id = $1 AND bs.semester = $2
            ORDER BY s.code ASC
        `;
        const result = await db.query(query, [branch_id, current_semester]);
        return result.rows;
    }
}

module.exports = SubjectService;
