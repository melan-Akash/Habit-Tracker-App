const express = require('express');
const {
  getHabits,
  createHabit,
  toggleHabit,
  deleteHabit,
} = require('../controllers/habitController');
const { optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(optionalAuth); // Seamless MongoDB access

router.route('/')
  .get(getHabits)
  .post(createHabit);

router.put('/:id/toggle', toggleHabit);
router.delete('/:id', deleteHabit);

module.exports = router;
