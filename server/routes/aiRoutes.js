const express = require('express');
const router = express.Router();
const { generateBio } = require('../controllers/aiController');

router.post('/bio', generateBio);

module.exports = router;
