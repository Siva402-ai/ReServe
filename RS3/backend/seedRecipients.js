
// Run this script to seed the 5 specific orphanage accounts into MongoDB
// Usage: node backend/seedRecipients.js

const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust path as needed based on your folder structure

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reserve_db';

const RECIPIENTS = [
  {
    id: 'r_karunyam',
    name: 'Karunyam Children Home',
    email: 'home1@reserve.com',
    password: '1234',
    role: 'RECIPIENT',
    organization: 'Karunyam Children Home',
    phone: '9876543210',
    address: 'Plot No. 28, 100 6, Madha Koil Street, Sathidanandapuram, Ponmar, Chennai, Thazhambur, Tamil Nadu 600127',
    location: { lat: 12.8711, lng: 80.1822 },
    accountStatus: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    phoneVerified: true,
  },
  {
    id: 'r_elshadai',
    name: 'El-Shadai Children Home',
    email: 'home2@reserve.com',
    password: '1234',
    role: 'RECIPIENT',
    organization: 'El-Shadai Children Home',
    phone: '9876543211',
    address: '37, Annai Theresa Street, Rajiv Gandhi Salai, Kazhipattur, Tamil Nadu 603103',
    location: { lat: 12.8145, lng: 80.2270 },
    accountStatus: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    phoneVerified: true
  },
  {
    id: 'r_igm',
    name: 'IGM Children Home',
    email: 'home3@reserve.com',
    password: '1234',
    role: 'RECIPIENT',
    organization: 'IGM Children Home',
    phone: '9876543212',
    address: '3, 1st Cross St, Veerabaghu Nagar, Guduvancheri, Tamil Nadu 603202',
    location: { lat: 12.8430, lng: 80.0620 },
    accountStatus: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    phoneVerified: true
  },
  {
    id: 'r_atheeswarar',
    name: 'Atheeswarar Charitable Trust',
    email: 'home4@reserve.com',
    password: '1234',
    role: 'RECIPIENT',
    organization: 'Atheeswarar Charitable Trust',
    phone: '9876543213',
    address: 'A2/344, Swaminagar - 4th Cross Street, Near Gayathri Mini Hall, Mudichur - Attai Company, Chennai, Tamil Nadu 600048',
    location: { lat: 12.9235, lng: 80.0760 },
    accountStatus: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    phoneVerified: true
  },
  {
    id: 'r_vasantham',
    name: 'Vasantham Charitable Trust',
    email: 'home5@reserve.com',
    password: '1234',
    role: 'RECIPIENT',
    organization: 'Vasantham Charitable Trust',
    phone: '9876543214',
    address: '1/246, 2nd Street, Rajiv Gandhi Nagar, Vengambakkam, Chennai, Tamil Nadu 600127',
    location: { lat: 12.8845, lng: 80.1475 },
    accountStatus: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    phoneVerified: true
  }
];

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    for (const recipient of RECIPIENTS) {
        // Check if exists
        const exists = await User.findOne({ email: recipient.email });
        if (!exists) {
            await User.create(recipient);
            console.log(`Created: ${recipient.name}`);
        } else {
            console.log(`Skipped (Exists): ${recipient.name}`);
        }
    }

    console.log('Seeding Complete');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
