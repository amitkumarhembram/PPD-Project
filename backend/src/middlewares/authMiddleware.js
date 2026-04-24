const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authorization header missing or invalid' });
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET || 'supersecretkey';

        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token is invalid or expired' });
    }
};

const verifyStudent = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user && req.user.role === 'student') {
            next();
        } else {
            res.status(403).json({ error: 'Access denied: Students only' });
        }
    });
};

const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ error: 'Access denied: Admins only' });
        }
    });
};

module.exports = {
    verifyStudent,
    verifyAdmin
};
