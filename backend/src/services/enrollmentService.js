const db = require('../config/db');

class EnrollmentService {
    static async getPrograms() {
        const query = 'SELECT id, name, level_id FROM program';
        const result = await db.query(query);
        return result.rows;
    }

    static async getBranches(programId) {
        const query = `
            SELECT b.id, b.name, b.capacity,
                   (b.capacity - COALESCE(e.enrolled_count, 0)) AS available_seats
            FROM branch b
            LEFT JOIN (
                SELECT branch_id, COUNT(*) as enrolled_count
                FROM enrollment
                WHERE status IN ('PENDING', 'APPROVED')
                GROUP BY branch_id
            ) e ON b.id = e.branch_id
            WHERE b.program_id = $1
        `;
        const result = await db.query(query, [programId]);
        return result.rows.map(row => ({
            ...row,
            available_seats: Number(row.available_seats)
        }));
    }

    static async enrollStudent(userId, branchId) {
        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            const studentRes = await client.query('SELECT status, highest_qualification FROM student WHERE id = $1', [userId]);
            if (studentRes.rowCount === 0) {
                throw new Error('Student not found');
            }
            
            const studentStatus = studentRes.rows[0].status;
            const qual = studentRes.rows[0].highest_qualification;
            
            if (studentStatus !== 'VERIFIED') {
                const err = new Error('Student must be VERIFIED to enroll');
                err.status = 403;
                throw err;
            }
            
            if (!qual || qual === '10th') {
                const err = new Error('Not eligible for enrollment');
                err.status = 403;
                throw err;
            }

            const enrollCheck = await client.query('SELECT id FROM enrollment WHERE student_id = $1', [userId]);
            if (enrollCheck.rowCount > 0) {
                const err = new Error('Student already has an enrollment record');
                err.status = 409;
                throw err;
            }

            const branchRes = await client.query(`
                SELECT b.capacity, p.level_id,
                       (SELECT COUNT(*) FROM enrollment WHERE branch_id = $1 AND status IN ('PENDING', 'APPROVED')) as enrolled_count
                FROM branch b
                JOIN program p ON b.program_id = p.id
                WHERE b.id = $1
                FOR UPDATE
            `, [branchId]);
            
            if (branchRes.rowCount === 0) {
                const err = new Error('Branch not found');
                err.status = 404;
                throw err;
            }

            const { capacity, enrolled_count, level_id } = branchRes.rows[0];

            if (qual === '12th' && level_id !== 1) {
                const err = new Error('Not eligible for Postgraduate programs');
                err.status = 403;
                throw err;
            }
            const available = capacity - parseInt(enrolled_count);

            if (available <= 0) {
                const err = new Error('Branch is full');
                err.status = 400;
                throw err;
            }

            const insertEnroll = `
                INSERT INTO enrollment (student_id, branch_id, status)
                VALUES ($1, $2, 'PENDING')
                RETURNING *;
            `;
            const newEnrollment = await client.query(insertEnroll, [userId, branchId]);

            await client.query(`UPDATE student SET status = 'ENROLLED' WHERE id = $1`, [userId]);

            await client.query('COMMIT');
            return newEnrollment.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async getMyEnrollment(userId) {
        const query = `
            SELECT e.id, e.status, e.current_semester, e.created_at, b.name as branch, p.name as program
            FROM enrollment e
            JOIN branch b ON e.branch_id = b.id
            JOIN program p ON b.program_id = p.id
            WHERE e.student_id = $1
        `;
        const result = await db.query(query, [userId]);
        return result.rows[0];
    }
}

module.exports = EnrollmentService;
