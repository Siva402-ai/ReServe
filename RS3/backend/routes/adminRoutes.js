
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Mock Auth Middleware
const authMiddleware = (req, res, next) => {
  // In real app, check JWT and ensure role is ADMIN
  next();
};

router.get('/users', authMiddleware, adminController.getAllUsers);
router.put('/users/:userId/status', authMiddleware, adminController.updateUserStatus);

module.exports = router;
