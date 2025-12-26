
const FoodPost = require('../models/FoodPost');
const { calculateDistance } = require('../utils/geoUtils'); // Assuming a util or we calculate in simple js below

// Helper for simple distance (optional, but good for sorting)
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

exports.getNgoFeed = async (req, res) => {
  try {
    const ngoId = req.user.id;
    const { lat, lng } = req.query; // NGO's current location from frontend

    // 1. Fetch posts that are either AVAILABLE or assigned to this NGO
    // We strictly select 'location' to ensure latitude/longitude are present for Maps integration
    const posts = await FoodPost.find({
      $or: [
        { status: 'AVAILABLE' },
        { acceptedNgoId: ngoId }
      ]
    }).select('donorName donorAddress items status location createdAt acceptedNgoId acceptedNgoName donorPhone');

    // 2. Process posts to add distance and sanitize
    const processedPosts = posts.map(post => {
      const p = post.toObject();
      
      // Calculate distance if NGO location provided
      if (lat && lng && p.location) {
        p.distance = parseFloat(getDistance(lat, lng, p.location.lat, p.location.lng).toFixed(1));
      }

      // Security: Hide sensitive donor info if not assigned
      const isAssignedToMe = p.acceptedNgoId === ngoId;
      if (!isAssignedToMe && p.status !== 'AVAILABLE') {
         // Should have been filtered out by query, but double check
      }
      
      if (!isAssignedToMe && p.status === 'AVAILABLE') {
        // Hide exact address until accepted (optional requirement, but good practice)
        // keeping donorAddress visible for now as per requirement to show "Open Maps"
      }

      return p;
    });

    // Sort: My pickups first, then nearest available
    processedPosts.sort((a, b) => {
      // Prioritize my active pickups
      const aIsMine = a.acceptedNgoId === ngoId;
      const bIsMine = b.acceptedNgoId === ngoId;
      if (aIsMine && !bIsMine) return -1;
      if (!aIsMine && bIsMine) return 1;

      // Then sort by distance
      return (a.distance || 0) - (b.distance || 0);
    });

    res.json({ success: true, posts: processedPosts });

  } catch (error) {
    console.error("Get NGO Feed Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch feed" });
  }
};

exports.acceptDonation = async (req, res) => {
  try {
    const { postId } = req.body;
    const ngoId = req.user.id;
    // Mock getting NGO details from User model (in real app, fetch User)
    const ngoName = "Helping Hands"; 
    const ngoPhone = "555-0123";

    const post = await FoodPost.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    if (post.status !== 'AVAILABLE') {
      return res.status(400).json({ success: false, message: "Post already taken" });
    }

    post.status = 'ACCEPTED';
    post.acceptedNgoId = ngoId;
    post.acceptedNgoName = ngoName;
    post.ngoPhone = ngoPhone;
    post.ngoRating = 4.8;
    post.ngoProfilePhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(ngoName)}&background=0D9488&color=fff`;
    
    await post.save();

    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error accepting donation" });
  }
};

exports.markReached = async (req, res) => {
  try {
    const { postId } = req.body;
    const ngoId = req.user.id;

    const post = await FoodPost.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    if (post.acceptedNgoId !== ngoId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    post.status = 'REACHED';
    await post.save();

    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating status" });
  }
};

exports.cancelPickup = async (req, res) => {
  try {
    const { postId } = req.body;
    const ngoId = req.user.id;

    const post = await FoodPost.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    // Validation: Only the assigned NGO can cancel
    if (post.acceptedNgoId !== ngoId) {
      return res.status(403).json({ success: false, message: "Unauthorized: You are not assigned to this pickup." });
    }

    // Reset status to AVAILABLE
    post.status = 'AVAILABLE';
    
    // Clear all NGO-related fields
    post.acceptedNgoId = undefined;
    post.acceptedNgoName = undefined;
    post.ngoPhone = undefined;
    post.ngoProfilePhoto = undefined;
    post.ngoRating = undefined;

    await post.save();

    res.json({ success: true, message: "Pickup cancelled. Post is available again." });
  } catch (error) {
    console.error("Cancel Pickup Error:", error);
    res.status(500).json({ success: false, message: "Error cancelling pickup" });
  }
};
