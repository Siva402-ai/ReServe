const mongoose = require('mongoose');

const FoodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: String, required: true },
  type: { type: String, required: true },
  timePrepared: { type: Date, required: true },
  storageTemp: { type: String },
  freshness: { type: String, enum: ['Fresh', 'Risky', 'Not Fresh', 'Unknown'], default: 'Unknown' }
});

const FoodPostSchema = new mongoose.Schema({
  donorId: { type: String, required: true },
  donorName: { type: String, required: true },
  donorAddress: { type: String },
  donorPhone: { type: String },
  items: [FoodItemSchema],
  status: { 
    type: String, 
    enum: ['AVAILABLE', 'ACCEPTED', 'REACHED', 'COMPLETED', 'CANCELLED'], 
    default: 'AVAILABLE' 
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  
  // NGO Details
  acceptedNgoId: { type: String },
  acceptedNgoName: { type: String },
  ngoPhone: { type: String },
  ngoProfilePhoto: { type: String },
  ngoRating: { type: Number },

  // Timestamps
  completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('FoodPost', FoodPostSchema);