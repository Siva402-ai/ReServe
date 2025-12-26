const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

const authMiddleware = (req, res, next) => {
  // Mock middleware matching donorRoutes
  // req.user = { id: req.headers['x-user-id'] || 'u3' }; // Defaulting to NGO ID for demo if header missing
  if(req.headers['x-user-id']) {
      req.user = { id: req.headers['x-user-id'] };
  } else {
      // Fallback for testing purely backend without frontend headers
      req.user = { id: 'u3' }; 
  }
  next();
};

router.get('/', authMiddleware, notificationController.getNotifications);
router.put('/:id/read', authMiddleware, notificationController.markRead);

module.exports = router;