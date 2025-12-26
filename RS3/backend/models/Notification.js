const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipientId: { type: String, required: true }, // User ID of the NGO
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: {
    donorId: String,
    pickupId: String,
    foodName: String
  },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);