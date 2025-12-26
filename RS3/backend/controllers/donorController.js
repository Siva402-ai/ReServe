const FoodPost = require('../models/FoodPost');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { geocodeAddress } = require('../services/geocode');

// Confirm Pickup
exports.confirmPickup = async (req, res) => {
  console.log("Confirm pickup API hit", { 
    userId: req.user.id, 
    body: req.body 
  });

  const { donationId } = req.body;
  const donorId = req.user.id; 

  try {
    const donation = await FoodPost.findById(donationId);

    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    if (donation.donorId !== donorId) {
      return res.status(403).json({ success: false, message: "Not authorized to confirm this pickup." });
    }

    if (donation.status !== 'REACHED') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot confirm pickup. Current status is ${donation.status}.` 
      });
    }

    donation.status = 'COMPLETED';
    donation.completedAt = new Date();
    await donation.save();

    return res.status(200).json({
      success: true,
      message: "Pickup confirmed. Donation completed.",
      updatedDonation: donation
    });

  } catch (error) {
    console.error("Confirm Pickup Error:", error);
    return res.status(500).json({ success: false, message: "Server error confirming pickup" });
  }
};

// Cancel Donation
exports.cancelDonation = async (req, res) => {
  const { donationId } = req.body;
  const donorId = req.user.id;

  try {
    const donation = await FoodPost.findById(donationId);
    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    if (donation.donorId !== donorId) {
      return res.status(403).json({ success: false, message: "Not authorized to cancel this donation." });
    }

    // Only allow cancelling if not completed or already cancelled
    if (['COMPLETED', 'CANCELLED'].includes(donation.status)) {
      return res.status(400).json({ success: false, message: "Cannot cancel donation in current status." });
    }

    donation.status = 'CANCELLED';
    await donation.save();

    return res.status(200).json({ success: true, message: "Donation cancelled successfully." });
  } catch (error) {
    console.error("Cancel Donation Error:", error);
    return res.status(500).json({ success: false, message: "Server error cancelling donation" });
  }
};

// Create Post & Notify NGOs
exports.createPost = async (req, res) => {
  try {
    const { 
      donorName, 
      items, 
      donorAddress, 
      donorPhone,
      donorLatitude, // Passed if Auto
      donorLongitude // Passed if Auto
    } = req.body;
    
    const donorId = req.user.id;
    
    let finalLocation = { lat: 0, lng: 0 };
    let finalNavigationAddress = ""; 

    // CASE 1: AUTO GPS (Preferred)
    if (donorLatitude && donorLongitude) {
       console.log("CreatePost: Using Auto GPS Coordinates");
       finalNavigationAddress = "GPS Location"; // Display label
       finalLocation = { lat: parseFloat(donorLatitude), lng: parseFloat(donorLongitude) };
    } 
    // CASE 2: MANUAL ADDRESS (Strict Geocoding)
    else if (donorAddress) {
       console.log("CreatePost: Processing Manual Address:", donorAddress);
       
       try {
         // CALL REAL GEOCODING SERVICE
         const coords = await geocodeAddress(donorAddress);
         
         // SUCCESS
         finalLocation = coords;
         finalNavigationAddress = donorAddress.trim(); // Store exact text for display
         console.log("Geocoding Successful:", coords);

       } catch (geoError) {
         // FAILURE - Do not create post
         console.error("Geocoding Failed:", geoError.message);
         return res.status(400).json({ 
           success: false, 
           message: `Location not found: ${geoError.message}. Please verify the address.` 
         });
       }
    } 
    else {
      return res.status(400).json({ success: false, message: "Location required. Use GPS or enter a valid address." });
    }

    // 1. Save Post with Validated Data
    const newPost = new FoodPost({
      donorId,
      donorName,
      donorAddress: finalNavigationAddress, 
      donorPhone,
      items,
      location: finalLocation, // Stores accurate Lat/Lng from GPS or Geocode
      status: 'AVAILABLE'
    });

    await newPost.save();

    // 2. Find all NGOs
    const ngos = await User.find({ role: 'NGO' });

    // 3. Create Notifications
    const notifications = ngos.map(ngo => ({
      recipientId: ngo.id,
      title: 'New Pickup Request',
      message: `${items.length} items available near ${finalNavigationAddress}`,
      data: {
        donorId,
        pickupId: newPost._id,
        foodName: items[0]?.name || 'Food Donation'
      },
      isRead: false
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // 4. Emit Socket Event
    const io = req.app.get('io');
    if (io) {
      io.emit('new_pickup_notification', {
        title: 'New Pickup Request',
        message: `${items.length} items available from ${donorName}`,
        pickupId: newPost._id,
        timestamp: new Date()
      });
    }

    res.status(201).json({ success: true, post: newPost });

  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({ success: false, message: "Failed to create post. Server Error." });
  }
};