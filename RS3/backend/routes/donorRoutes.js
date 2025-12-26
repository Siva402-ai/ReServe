const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donorController');

// Middleware to mock auth for this example (Replace with real JWT middleware)
const authMiddleware = (req, res, next) => {
  // In a real app, verify token and set req.user
  if(req.body.donorId) {
      req.user = { id: req.body.donorId };
  } else if (req.headers['x-user-id']) {
      req.user = { id: req.headers['x-user-id'] };
  }
  next();
};

// Route: POST /api/donor/confirm-pickup
router.post('/confirm-pickup', authMiddleware, donorController.confirmPickup);

// Route: POST /api/donor/cancel-donation
router.post('/cancel-donation', authMiddleware, donorController.cancelDonation);

// Route: POST /api/donor/create-post
router.post('/create-post', authMiddleware, donorController.createPost);

module.exports = router;