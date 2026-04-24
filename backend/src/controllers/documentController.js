const DocumentService = require('../services/documentService');

class DocumentController {
    static async upload(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded or file rejected by filter.' });
            }
            
            const userId = req.user.id;
            const type = req.body.type;
            const fileUrl = `/uploads/${req.file.filename}`;
            const physicalPath = req.file.path;

            const savedDoc = await DocumentService.uploadDocument(userId, type, fileUrl, physicalPath);
            
            res.status(201).json({
                message: 'Document uploaded',
                document: savedDoc
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async getMyDocuments(req, res) {
        try {
            const userId = req.user.id;
            const result = await DocumentService.getStudentDocuments(userId);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = DocumentController;
