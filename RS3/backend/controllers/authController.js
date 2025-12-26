
const Otp = require('../models/Otp');

// Generate and Send OTP
exports.sendOtp = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ success: false, message: "Phone number is required" });

  try {
    // Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set Expiration (5 mins from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Delete existing OTP for this phone if any
    await Otp.deleteMany({ phone });

    // Save new OTP
    await Otp.create({ phone, code, expiresAt });

    // MOCK SMS SENDING
    console.log(`[SMS MOCK] OTP for ${phone}: ${code}`);
    
    // In production, call Twilio/SNS here:
    // await smsService.send(phone, `Your ReServe code is ${code}`);

    res.json({ success: true, message: "OTP sent successfully" });

  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ success: false, message: "Phone and code required" });

  try {
    const otpRecord = await Otp.findOne({ phone });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "OTP expired or not found. Please request again." });
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ success: false, message: "Too many failed attempts. Please request a new OTP." });
    }

    // Verify Code
    if (otpRecord.code === code) {
      // Success - Delete used OTP
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.json({ success: true, message: "Phone verified successfully" });
    } else {
      // Increment attempts
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ 
        success: false, 
        message: `Invalid code. ${3 - otpRecord.attempts} attempts remaining.` 
      });
    }

  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};
