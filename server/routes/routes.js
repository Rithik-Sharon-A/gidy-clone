const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const aiRoutes = require('./aiRoutes');
const authRoutes = require('./authRoutes');

router.use('/user', userRoutes);
router.use('/ai', aiRoutes);
router.use('/auth', authRoutes);

module.exports = router;
