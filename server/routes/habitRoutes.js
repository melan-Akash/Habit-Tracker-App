const express = require('express');
const {
  getHabits,
  createHabit,
  toggleHabit,
  deleteHabit,
} = require('../controllers/habitController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All habit routes require JWT authentication

router.route('/')
  .get(getHabits)
  .post(createHabit);

router.put('/:id/toggle', toggleHabit);
router.delete('/:id', deleteHabit);

module.exports = router;
