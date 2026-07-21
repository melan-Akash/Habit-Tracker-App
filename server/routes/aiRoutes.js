const express = require('express');
const { chatWithCoach, generateRoutine } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // Requires authentication

router.post('/chat', chatWithCoach);
router.post('/generate-routine', generateRoutine);

module.exports = router;
