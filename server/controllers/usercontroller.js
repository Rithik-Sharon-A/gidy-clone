const User = require('../models/User');

// POST /api/user/register - create single user
const register = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.body.email },
      req.body,
      { upsert: true, new: true }
    );
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// GET /api/user/profile - return logged-in user's profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user).select('email profile');
    if (!user) return res.status(404).json({ error: 'Profile not found' });
    res.json({ email: user.email, ...user.profile.toObject() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/user/profile - update logged-in user's profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user,
      { $set: { profile: req.body } },
      { new: true }
    ).select('email profile');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ email: user.email, ...user.profile.toObject() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { register, getProfile, updateProfile };
