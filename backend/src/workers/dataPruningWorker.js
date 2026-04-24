const cron = require('node-cron');
const db = require('../config/db');
const fs = require('fs');
const path = require('path');

const pruneData = async () => {
    console.log('--- Started Nightly Data Pruning Worker ---');
    try {
        // 1. Fetch all documents for REJECTED students to delete the physical files
        const docsQuery = `
            SELECT file_url FROM documents 
            WHERE student_id IN (SELECT id FROM student WHERE status = 'REJECTED')
        `;
        const docsResult = await db.query(docsQuery);

        // 2. Erase physical files
        let deletedFilesCount = 0;
        for (const doc of docsResult.rows) {
            if (doc.file_url) {
                // file_url is stored as e.g. /uploads/filename.ext
                const fullPath = path.join(__dirname, '..', '..', doc.file_url);
                if (fs.existsSync(fullPath)) {
                    try {
                        fs.unlinkSync(fullPath);
                        deletedFilesCount++;
                    } catch (err) {
                        console.error(`Failed to delete file: ${fullPath}`, err);
                    }
                }
            }
        }

        // 3. Drop relational records from DB (Soft-drop relative to the student)
        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            const rejectedStudentsQuery = `SELECT id FROM student WHERE status = 'REJECTED'`;
            
            await client.query(`DELETE FROM documents WHERE student_id IN (${rejectedStudentsQuery})`);
            await client.query(`DELETE FROM academic_details WHERE student_id IN (${rejectedStudentsQuery})`);
            await client.query(`DELETE FROM family_details WHERE student_id IN (${rejectedStudentsQuery})`);
            await client.query(`DELETE FROM address WHERE student_id IN (${rejectedStudentsQuery})`);

            // Also clear the profile photo URL on the student object itself if we want to save space
            await client.query(`UPDATE student SET profile_photo_url = NULL WHERE status = 'REJECTED'`);

            await client.query('COMMIT');
            console.log(`Pruning complete: Dropped heavy relational data for REJECTED students. Eradicated ${deletedFilesCount} physical files.`);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (e) {
        console.error('Error during Nightly Data Pruning:', e);
    }
    console.log('--- Finished Nightly Data Pruning Worker ---');
};

const startWorker = () => {
    // Schedule for Midnight (0 0 * * *)
    cron.schedule('0 0 * * *', pruneData);
    console.log('Data Pruning Worker scheduled to run nightly at midnight.');
};

module.exports = {
    startWorker,
    pruneData // Exported for manual invocation testing
};
