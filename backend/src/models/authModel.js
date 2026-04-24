const db = require('../config/db');

class AuthModel {
    static async createUser({ name, email, password }) {
        const query = `
            INSERT INTO student (name, email, password)
            VALUES ($1, $2, $3)
            RETURNING id, name, email;
        `;
        const result = await db.query(query, [name, email, password]);
        return result.rows[0];
    }

    static async getUserByEmail(email) {
        const query = `SELECT * FROM student WHERE email = $1`;
        const result = await db.query(query, [email]);
        return result.rows[0];
    }

    static async createAdmin({ name, email, password, role = 'SUPERADMIN' }) {
        const query = `
            INSERT INTO admin (name, email, password, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, email, role;
        `;
        const result = await db.query(query, [name, email, password, role]);
        return result.rows[0];
    }

    static async getAdminByEmail(email) {
        const query = `SELECT * FROM admin WHERE email = $1`;
        const result = await db.query(query, [email]);
        return result.rows[0];
    }
}

module.exports = AuthModel;
