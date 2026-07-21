const express = require('express');
const {
  chatWithCoach,
  generateRoutine,
  analyzeProgress,
  parseTextToHabit,
  optimizeHabit,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All routes require JWT authentication

router.post('/chat', chatWithCoach);
router.post('/generate-routine', generateRoutine);
router.post('/analyze-progress', analyzeProgress);
router.post('/parse-text', parseTextToHabit);
router.post('/optimize-habit', optimizeHabit);

module.exports = router;
