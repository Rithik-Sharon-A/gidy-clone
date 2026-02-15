const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { register, getProfile, updateProfile } = require('../controllers/usercontroller');

router.post('/register', register);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

module.exports = router;
