const express = require('express');
const {
  getAllReviews,
  createReview,
} = require('../controllers/reviewController');
const { auth, restrictTo } = require('../controllers/userController');

const router = express.Router();

router
  .route('/')
  .get(getAllReviews)
  .post(auth, restrictTo('user'), createReview);

module.exports = router;
