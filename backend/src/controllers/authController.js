const AuthService = require('../services/authService');

class AuthController {
    static async register(req, res) {
        try {
            await AuthService.registerUser(req.body);
            res.status(201).json({ message: 'Account created' });
        } catch (error) { res.status(400).json({ error: error.message }); }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const data = await AuthService.loginUser(email, password);
            res.status(200).json(data);
        } catch (error) { res.status(401).json({ error: error.message || 'Invalid email or password' }); }
    }

    static async registerAdmin(req, res) {
        try {
            await AuthService.registerAdmin(req.body);
            res.status(201).json({ message: 'Admin account created' });
        } catch (error) { res.status(400).json({ error: error.message }); }
    }

    static async loginAdmin(req, res) {
        try {
            const { email, password } = req.body;
            const data = await AuthService.loginAdmin(email, password);
            res.status(200).json(data);
        } catch (error) { res.status(401).json({ error: error.message || 'Invalid email or password' }); }
    }
}

module.exports = AuthController;
