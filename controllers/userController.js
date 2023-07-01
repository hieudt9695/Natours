const jwt = require('jsonwebtoken');
const User = require('../models/user');
const APIFeature = require('../utils/api-features');
const AppError = require('../utils/app-error');
const catchAsync = require('../utils/catchAsync');

const queryKeys = ['name'];

exports.getAllUsers = catchAsync(async (req, res) => {
  const query = new APIFeature(User.find(), req.query, queryKeys)
    .filter()
    .sort()
    .paginate()

    .exec();

  const users = await query;
  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});

exports.createUser = catchAsync(async (req, res) => {
  const { name, email, photo, password, passwordConfirm } = req.body;
  const newUser = await User.create({
    name,
    email,
    photo,
    password,
    passwordConfirm,
  });

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

exports.checkUserId = (req, res, next, val) => {
  console.log('check user id');
  next();
};

exports.getOneUser = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'This route is not defined yet!',
  });
};

exports.updateUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);

  Object.keys(req.body).forEach((key) => {
    user.set(key, req.body[key]);
  });

  await user.save();

  res.status(200).json({
    status: 'success',
  });
});

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'This route is not defined yet!',
  });
};

exports.getUserStatistic = async (req, res) => {
  const data = await User.aggregate([
    {
      $match: {
        createdAt: {
          $ne: null,
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        users: { $push: '$name' },
        numUsers: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data,
    },
  });
};

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError('Email and password is required.', 400);
  }

  const loginUser = await User.findOne({ email }).select('+password');
  const isPasswordCorrect = await loginUser.correctPassword(
    password,
    loginUser.password
  );

  if (!loginUser || !isPasswordCorrect) {
    throw new AppError('Email or password is incorrect.', 404);
  }

  const token = jwt.sign({ id: loginUser.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.json({
    status: 'success',
    data: {
      token,
    },
  });
});

exports.auth = catchAsync(async (req, res, next) => {
  next();
});
