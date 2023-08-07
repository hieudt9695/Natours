// eslint-disable-next-line no-unused-vars
const Tour = require('../models/tour');
const APIFeature = require('../utils/api-features');
const AppError = require('../utils/app-error');
const catchAsync = require('../utils/catchAsync');

const tourQueryKeys = ['duration', 'difficulty', 'price'];

exports.checkTourID = (req, res, next, val) => {
  next();
};

exports.getTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage price';
  req.query.select = 'name ratingsAverage price';
  next();
};

exports.getAllTours = catchAsync(async (req, res) => {
  const query = new APIFeature(Tour.find(), req.query, tourQueryKeys)
    .filter()
    .sort()
    .fieldLimit()
    .paginate()
    .exec();

  const tours = await query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.createTour = catchAsync(async (req, res) => {
  const newTour = await Tour.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.getTourById = catchAsync(async (req, res) => {
  const tour = await Tour.findById(req.params.id).populate('reviews');

  if (!tour) {
    throw new AppError('Tour not found!', 404);
  }
  res.status(200).json({
    status: 'success',
    data: tour,
  });
});

exports.updateTour = catchAsync(async (req, res) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    throw new AppError('Tour not found!', 404);
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    throw new AppError('Tour not found!', 404);
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $group: {
        _id: {
          $toUpper: '$difficulty',
        },
        numTour: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        maxRating: { $max: '$ratingsAverage' },
        minRating: { $min: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },

        maxPrice: { $max: '$price' },
        minPrice: { $min: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.deleteAllTours = catchAsync(async (req, res) => {
  await Tour.deleteMany();
  res.status(200).json({
    status: 'success',
    data: [],
  });
});

exports.getTourMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1;
  const monthNames = [
    '',
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`).toISOString(),
          $lt: new Date(`${year + 1}-01-01`).toISOString(),
        },
      },
    },
    {
      $group: {
        _id: {
          $month: {
            $dateFromString: {
              dateString: '$startDates',
            },
          },
        },
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
        monthName: {
          $arrayElemAt: [monthNames, '$_id'],
        },
      },
    },
    { $project: { _id: 0 } },
    { $sort: { month: 1 } },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
