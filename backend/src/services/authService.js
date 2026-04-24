const AuthModel = require('../models/authModel');
const { hashPassword, comparePassword, generateToken } = require('../utils/authHelper');

class AuthService {
    static async registerUser(userData) {
        const { name, email, password } = userData;
        const existingUser = await AuthModel.getUserByEmail(email);
        if (existingUser) {
            throw new Error('User already exists');
        }
        const hashedPassword = await hashPassword(password);
        const user = await AuthModel.createUser({ name, email, password: hashedPassword });
        return user;
    }

    static async loginUser(email, password) {
        const user = await AuthModel.getUserByEmail(email);
        if (!user) { throw new Error('Invalid email or password'); }
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) { throw new Error('Invalid email or password'); }
        const token = generateToken({ id: user.id, name: user.name, email: user.email, role: 'student' });
        return { token };
    }

    static async registerAdmin(adminData) {
        const { name, email, password, role } = adminData;
        const existingAdmin = await AuthModel.getAdminByEmail(email);
        if (existingAdmin) {
            throw new Error('Admin already exists');
        }
        const hashedPassword = await hashPassword(password);
        const admin = await AuthModel.createAdmin({ name, email, password: hashedPassword, role });
        return admin;
    }

    static async loginAdmin(email, password) {
        const admin = await AuthModel.getAdminByEmail(email);
        if (!admin) { throw new Error('Invalid email or password'); }
        const isMatch = await comparePassword(password, admin.password);
        if (!isMatch) { throw new Error('Invalid email or password'); }
        const token = generateToken({ id: admin.id, name: admin.name, email: admin.email, role: 'admin', adminRole: admin.role });
        return { token };
    }
}

module.exports = AuthService;
