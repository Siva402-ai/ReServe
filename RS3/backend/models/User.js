
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: { type: String, unique: true }, // maintaining compatibility with mockDB IDs
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // In real app, hash this
  role: { type: String, enum: ['DONOR', 'NGO', 'ADMIN'], required: true },
  organization: { type: String },
  phone: { type: String },
  address: { type: String },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  accountStatus: { 
    type: String, 
    enum: ['ACTIVE', 'DISABLED'], 
    default: 'ACTIVE' 
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
