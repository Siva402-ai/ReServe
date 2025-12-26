
const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'name role email phone accountStatus organization createdAt');
    res.json({ success: true, users });
  } catch (error) {
    console.error("Fetch Users Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'DISABLED'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const user = await User.findByIdAndUpdate(userId, { accountStatus: status }, { new: true });
    
    if (!user) {
      // Fallback check for custom ID
      const userByCustomId = await User.findOneAndUpdate({ id: userId }, { accountStatus: status }, { new: true });
      if (!userByCustomId) return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: `User status updated to ${status}` });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
};
