const AppError = require('../utils/app-error');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path === '_id' ? 'Id' : err.path}: ${
    err.value
  }`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value: ${err?.keyValue?.name}`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((item) => item.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid Token. Please check!', 401);
const handleJWTExpired = () => new AppError('Jwt expired', 401);

const senErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  if (!err.isOperational) {
    console.error(err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
      err,
    });
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

exports.handleGlobalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    senErrorDev(err, res);
  } else {
    let customError = err;
    if (customError.name === 'CastError') {
      customError = handleCastErrorDB(customError);
    } else if (customError.code === 11000) {
      customError = handleDuplicateFieldsDB(customError);
    } else if (customError.name === 'ValidationError') {
      customError = handleValidationErrorDB(customError);
    } else if (customError.name === 'JsonWebTokenError') {
      customError = handleJWTError();
    } else if (customError.name === 'TokenExpiredError') {
      customError = handleJWTExpired();
    }
    sendErrorProd(customError, res);
  }
};
