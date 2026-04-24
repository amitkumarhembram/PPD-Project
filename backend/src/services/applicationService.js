const db = require('../config/db');

class ApplicationService {
    static async updateProfile(userId, data) {
        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            const {
                name, email, dob, gender, phone, aadhar_number, highest_qualification, profile_photo_url,
                family_details, addresses, academic_details
            } = data;

            // 1. Update Student Table
            await client.query(`
                UPDATE student
                SET name = COALESCE($1, name), email = COALESCE($2, email), dob = $3, gender = $4, phone = $5, aadhar_number = $6,
                    highest_qualification = $7, profile_photo_url = $8
                WHERE id = $9
            `, [name, email, dob, gender, phone, aadhar_number, highest_qualification, profile_photo_url, userId]);

            // 2. UPSERT Family Details
            if (family_details) {
                const fd = family_details;
                await client.query(`
                    INSERT INTO family_details
                    (student_id, father_name, father_phone, mother_name, mother_phone, guardian_name, guardian_phone)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT (student_id) DO UPDATE SET
                        father_name = EXCLUDED.father_name,
                        father_phone = EXCLUDED.father_phone,
                        mother_name = EXCLUDED.mother_name,
                        mother_phone = EXCLUDED.mother_phone,
                        guardian_name = EXCLUDED.guardian_name,
                        guardian_phone = EXCLUDED.guardian_phone
                `, [userId, fd.father_name, fd.father_phone, fd.mother_name, fd.mother_phone,
                    fd.guardian_name || null, fd.guardian_phone || null]);
            }

            // 3. UPSERT Addresses
            if (addresses && Array.isArray(addresses)) {
                for (const addr of addresses) {
                    await client.query(`
                        INSERT INTO address (student_id, type, state, district, pincode, village)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        ON CONFLICT (student_id, type) DO UPDATE SET
                            state = EXCLUDED.state,
                            district = EXCLUDED.district,
                            pincode = EXCLUDED.pincode,
                            village = EXCLUDED.village
                    `, [userId, addr.type, addr.state, addr.district, addr.pincode, addr.village]);
                }
            }

            // 4. UPSERT Academic Details
            if (academic_details) {
                const ad = academic_details;
                await client.query(`
                    INSERT INTO academic_details
                    (student_id, class10_board, class10_percentage, class10_passing_year, class10_school,
                     class12_board, class12_percentage, class12_passing_year, class12_school,
                     ug_university, ug_percentage, ug_passing_year, ug_college)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    ON CONFLICT (student_id) DO UPDATE SET
                        class10_board = EXCLUDED.class10_board,
                        class10_percentage = EXCLUDED.class10_percentage,
                        class10_passing_year = EXCLUDED.class10_passing_year,
                        class10_school = EXCLUDED.class10_school,
                        class12_board = EXCLUDED.class12_board,
                        class12_percentage = EXCLUDED.class12_percentage,
                        class12_passing_year = EXCLUDED.class12_passing_year,
                        class12_school = EXCLUDED.class12_school,
                        ug_university = EXCLUDED.ug_university,
                        ug_percentage = EXCLUDED.ug_percentage,
                        ug_passing_year = EXCLUDED.ug_passing_year,
                        ug_college = EXCLUDED.ug_college
                `, [userId,
                    ad.class10_board, ad.class10_percentage, ad.class10_passing_year, ad.class10_school,
                    ad.class12_board, ad.class12_percentage, ad.class12_passing_year, ad.class12_school,
                    ad.ug_university || null, ad.ug_percentage || null, ad.ug_passing_year || null, ad.ug_college || null
                ]);
            }

            await client.query('COMMIT');
            return { message: 'Profile updated' };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async submitForVerification(userId) {
        const result = await db.query(
            `UPDATE student SET status = 'SUBMITTED' WHERE id = $1 RETURNING status`,
            [userId]
        );
        if (result.rowCount === 0) throw new Error('Student not found');
        return { message: 'Profile submitted for verification', status: result.rows[0].status };
    }

    static async getApplicationStatus(userId) {
        const result = await db.query(
            'SELECT status, highest_qualification, profile_photo_url FROM student WHERE id = $1', [userId]
        );
        if (result.rows.length === 0) throw new Error('Student not found');
        return {
            status: result.rows[0].status,
            highest_qualification: result.rows[0].highest_qualification,
            profile_photo_url: result.rows[0].profile_photo_url
        };
    }

    static async getFullApplication(userId) {
        const [studentRes, familyRes, addressRes, academicRes] = await Promise.all([
            db.query('SELECT name, email, dob, gender, phone, aadhar_number, highest_qualification, profile_photo_url, status FROM student WHERE id = $1', [userId]),
            db.query('SELECT * FROM family_details WHERE student_id = $1', [userId]),
            db.query('SELECT * FROM address WHERE student_id = $1', [userId]),
            db.query('SELECT * FROM academic_details WHERE student_id = $1', [userId])
        ]);

        if (studentRes.rows.length === 0) throw new Error('Student not found');

        const student = studentRes.rows[0];
        const family = familyRes.rows[0] || null;
        const addresses = addressRes.rows;
        const academic = academicRes.rows[0] || null;

        const currentAddr = addresses.find(a => a.type === 'current') || {};
        const permanentAddr = addresses.find(a => a.type === 'permanent') || {};

        return {
            name: student.name || '',
            email: student.email || '',
            dob: student.dob ? new Date(student.dob).toISOString().split('T')[0] : '',
            gender: student.gender || '',
            phone: student.phone || '',
            aadhar_number: student.aadhar_number || '',
            highest_qualification: student.highest_qualification || '',
            profile_photo_url: student.profile_photo_url || '',
            status: student.status,
            family_details: family ? {
                father_name: family.father_name || '',
                father_phone: family.father_phone || '',
                mother_name: family.mother_name || '',
                mother_phone: family.mother_phone || '',
                guardian_name: family.guardian_name || '',
                guardian_phone: family.guardian_phone || ''
            } : {
                father_name: '', father_phone: '',
                mother_name: '', mother_phone: '',
                guardian_name: '', guardian_phone: ''
            },
            current_address: {
                state: currentAddr.state || '',
                district: currentAddr.district || '',
                pincode: currentAddr.pincode || '',
                village: currentAddr.village || ''
            },
            permanent_address: {
                state: permanentAddr.state || '',
                district: permanentAddr.district || '',
                pincode: permanentAddr.pincode || '',
                village: permanentAddr.village || ''
            },
            academic_details: academic ? {
                class10_board: academic.class10_board || '',
                class10_percentage: academic.class10_percentage || '',
                class10_passing_year: academic.class10_passing_year || '',
                class10_school: academic.class10_school || '',
                class12_board: academic.class12_board || '',
                class12_percentage: academic.class12_percentage || '',
                class12_passing_year: academic.class12_passing_year || '',
                class12_school: academic.class12_school || '',
                ug_university: academic.ug_university || '',
                ug_percentage: academic.ug_percentage || '',
                ug_passing_year: academic.ug_passing_year || '',
                ug_college: academic.ug_college || ''
            } : {
                class10_board: '', class10_percentage: '', class10_passing_year: '', class10_school: '',
                class12_board: '', class12_percentage: '', class12_passing_year: '', class12_school: '',
                ug_university: '', ug_percentage: '', ug_passing_year: '', ug_college: ''
            }
        };
    }
}

module.exports = ApplicationService;
