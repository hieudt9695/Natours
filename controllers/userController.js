const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../models/user');
const APIFeature = require('../utils/api-features');
const AppError = require('../utils/app-error');
const catchAsync = require('../utils/catchAsync');
const { sendEmail } = require('../utils/email');

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

  const isPasswordCorrect = loginUser
    ? await loginUser.correctPassword(password, loginUser.password)
    : false;

  if (!loginUser || !isPasswordCorrect) {
    throw new AppError('Email or password is incorrect.', 401);
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
  const { authorization } = req.headers;
  let token = '';
  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('you are not authen.', 401);
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const loginUser = await User.findById(decoded.id);

  if (!loginUser) {
    throw new AppError('you are not authen.', 401);
  }

  req.user = loginUser;
  next();
});

exports.restrictTo = (...roles) =>
  catchAsync(async (req, res, next) => {
    if (roles.includes(req.user.role)) return next();
    throw new AppError('You are not allowed!', 401);
  });

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    throw new AppError('User not found!', 404);
  }

  // create reset token
  const resetToken = user.createPasswordResetToken();

  const requestUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/reset-password/${resetToken}`;
  const message = `Click here to reset password ${requestUrl}`;

  try {
    await sendEmail({
      email: 'dangtrunghieu147@gmail.com',
      subject: 'Reset passsword',
      message,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError('Send mail fail', 500);
  }

  res.status(200).json({
    status: 'success',
    message: 'Token send to email',
  });

  await user.save({ validateBeforeSave: false });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token: resetToken } = req.params;
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  const user = await User.findOne({ passwordResetToken: hashedToken });

  if (!user) {
    throw new AppError('User not found!', 404);
  }

  if (user.passwordResetExpires < Date.now()) {
    throw new AppError('Token expired', 401);
  }

  if (req.body.password !== req.body.passwordConfirm) {
    throw new AppError('Password is not match', 401);
  }
  //update user password
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  // sign new JWT
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(200).json({
    status: 'success',
    data: {
      token,
    },
  });
});

exports.updatePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');
  if (!user || !(await user.correctPassword(currentPassword, user.password))) {
    throw new AppError('password is incorrect.', 401);
  }

  user.password = newPassword;
  await user.save();

  // sign new JWT
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(200).json({
    status: 'success',
    data: {
      token,
    },
  });
});

exports.updateProfile = catchAsync(async (req, res) => {});
