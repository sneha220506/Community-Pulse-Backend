const User = require("../models/User");
const { AppError } = require("../middleware/errorHandler");
const verificationEmailTemplate = require("../utils/emailTemplates/verificationEmail");
const welcomeEmail = require("../utils/emailTemplates/welcomeEmail");
const crypto = require("crypto");
const resetPasswordEmail = require("../utils/emailTemplates/resetPasswordEmail");
const bcrypt = require("bcryptjs/dist/bcrypt");
const { generateOTP } = require("../utils/generateOTP");
const sendEmail = require("../utils/sendEmail");

const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      role,
      organization,
      phone,
      skills,
      availability,
      location,
      region,
      preferredCategories,
    } = req.body;

    // ✅ Validation
    if (!name || !email || !password) {
      return next(new AppError("Required fields missing", 400));
    }

    if (password !== confirmPassword) {
      return next(new AppError("Passwords do not match", 400));
    }

    // ✅ Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError("Email already registered", 400));
    }

    // ✅ Convert comma string → array
    const skillsArray = Array.isArray(skills)
      ? skills
      : skills
        ? skills.split(",").map((s) => s.trim())
        : [];

    const categoriesArray = Array.isArray(preferredCategories)
      ? preferredCategories
      : preferredCategories
        ? preferredCategories.split(",").map((c) => c.trim())
        : [];

    const roleAvatars = {
      admin: "👑",
      volunteer: "👩‍💼",
      coordinator: "👷",
      viewer: "👷",
    };
    const avatar = roleAvatars[req.body.role] || "👤";

    // ✅ Generate OTP
    const otp = generateOTP();

    const user = await User.create({
      name,
      email,
      password,
      role: role || "viewer",
      organization,
      phone,

      avatar: avatar,
      skills: skillsArray,
      availability,
      location,
      region,
      preferredCategories: categoriesArray,

      isVerified: false,
      verificationCode: otp,
      verificationExpires: Date.now() + 10 * 60 * 1000,
    });

    // ✅ Send Email
    await sendEmail(
      email,
      "Verify Your Email - CommunityPulse",
      verificationEmailTemplate(otp),
    );

    res.status(201).json({
      success: true,
      message: "OTP sent. Please verify your email.",
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    // Find user with password field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new AppError("Invalid credentials", 401));
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    console.log(isMatch);
    if (!isMatch) {
      return next(new AppError("Invalid credentials", 401));
    }

    // Update last login
    user.lastLogin = new Date();
    // user.save() ki jagah ye use karein:
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    const token = user.generateAuthToken();

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ["name", "phone", "organization", "avatar"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select("+password");

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(new AppError("Current password is incorrect", 401));
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    const token = user.generateAuthToken();

    res.json({
      success: true,
      message: "Password changed successfully",
      token,
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user || user.verificationCode !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  if (user.verificationExpires < Date.now()) {
    return res.status(400).json({ message: "OTP expired" });
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  await sendEmail(
    email,
    "Welcome to  - CommunityPulse",
    welcomeEmail(user.name),
  );
  await user.save();

  res.json({ message: "Email verified" });
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    // 🔒 Don't reveal if email exists
    if (!user) {
      return res.json({ message: "If email exists, link sent" });
    }

    // ✅ Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 🔐 Hash token before saving
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    const url = `https://communitypulse-a614d.web.app/reset/${resetToken}`;
    console.log("TRIGGERING EMAIL NOW");
    // ✅ Use your template
    await sendEmail(
      email,
      "Reset Your Password - CommunityPulse",
      resetPasswordEmail(url),
    );

    res.json({ message: "Reset link sent" });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return next(new AppError("Passwords do not match", 400));
    }

    // 🔐 Hash incoming token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
    });
    console.log(user);
    if (!user) {
      return next(new AppError("Invalid or expired token", 400));
    }

    // ✅ Update password
    user.password = await bcrypt.hash(password, 10);

    // ✅ Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  resetPassword,
  forgotPassword,
  verifyEmail,
};
