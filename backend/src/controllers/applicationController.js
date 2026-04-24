const ApplicationService = require('../services/applicationService');

class ApplicationController {
    static async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const result = await ApplicationService.updateProfile(userId, req.body);
            res.status(200).json(result);
        } catch (error) {
            if (error.code === '23505') {
                return res.status(400).json({ error: 'Data conflict. Email or Aadhaar may already be registered to another account.' });
            }
            res.status(400).json({ error: error.message });
        }
    }

    static async submitForVerification(req, res) {
        try {
            const userId = req.user.id;
            const result = await ApplicationService.submitForVerification(userId);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async getStatus(req, res) {
        try {
            const userId = req.user.id;
            const result = await ApplicationService.getApplicationStatus(userId);
            res.status(200).json(result);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    static async getFullData(req, res) {
        try {
            const userId = req.user.id;
            const result = await ApplicationService.getFullApplication(userId);
            res.status(200).json(result);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
    static async uploadPhoto(req, res) {
        try {
            if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
            const userId = req.user.id;
            const fileUrl = `/uploads/${req.file.filename}`;
            await require('../config/db').query(
                'UPDATE student SET profile_photo_url = $1 WHERE id = $2',
                [fileUrl, userId]
            );
            res.status(200).json({ profile_photo_url: fileUrl });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = ApplicationController;
