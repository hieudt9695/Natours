const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
var cookieParser = require('cookie-parser');
const tourRoutes = require('./routes/tourRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const AppError = require('./utils/app-error');
const { handleGlobalError } = require('./controllers/errorController');

const app = express();

const limiter = rateLimit({
  max: 5,
  windowMs: 60 * 60 * 1000,
});

app.use('/api', limiter);
app.use(helmet());

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use(mongoSanitize());
app.use(xssClean());

app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/reviews', reviewRoutes);

app.all('*', (req, res, next) => {
  const err = new AppError(`Cannot find ${req.method} ${req.originalUrl}`, 404);
  next(err);
});

app.use(handleGlobalError);

module.exports = app;
