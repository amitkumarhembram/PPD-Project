const db = require('../config/db');
const fs = require('fs');

class DocumentService {
    static async uploadDocument(userId, type, fileUrl, physicalPath) {
        const validTypes = [
            'aadhar_card',
            '10th_marksheet',
            '10th_certificate',
            '12th_marksheet',
            '12th_certificate',
            'ug_marksheet',
            'ug_certificate'
        ];

        if (!validTypes.includes(type)) {
            // Unlink physically right away if invalid ENUM
            if (fs.existsSync(physicalPath)) {
                fs.unlinkSync(physicalPath);
            }
            throw new Error(`Invalid document type: ${type}`);
        }

        try {
            const query = `
                INSERT INTO documents (student_id, type, file_url)
                VALUES ($1, $2, $3)
                RETURNING id, type, file_url;
            `;
            const result = await db.query(query, [userId, type, fileUrl]);
            return result.rows[0];
        } catch (error) {
            // Cleanup on insert failure
            if (fs.existsSync(physicalPath)) {
                fs.unlinkSync(physicalPath);
            }
            throw error;
        }
    }
    static async getStudentDocuments(userId) {
        const result = await db.query(
            `SELECT id, type, file_url, created_at FROM documents WHERE student_id = $1 ORDER BY created_at DESC`,
            [userId]
        );
        return result.rows;
    }
}

module.exports = DocumentService;
