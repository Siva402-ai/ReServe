
const express = require('express');
const router = express.Router();
const ngoController = require('../controllers/ngoController');

// Middleware to mock auth (Replace with real JWT middleware)
const authMiddleware = (req, res, next) => {
  if(req.headers['x-user-id']) {
      req.user = { id: req.headers['x-user-id'] };
  } else {
      // Fallback for testing
      req.user = { id: 'u3' }; 
  }
  next();
};

router.get('/feed', authMiddleware, ngoController.getNgoFeed);
router.post('/accept', authMiddleware, ngoController.acceptDonation);
router.post('/reached', authMiddleware, ngoController.markReached);
router.post('/cancel', authMiddleware, ngoController.cancelPickup);

module.exports = router;
