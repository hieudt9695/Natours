const Review = require('../models/review');
const catchAsync = require('../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find().populate('tourID');
  res.json({
    status: 'success',
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const { review, rating, tourID } = req.body;
  const newReview = await new Review({
    review,
    rating,
    userID: req.user.id,
    tourID,
  }).save();

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});
