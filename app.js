const express = require('express');
const morgan = require('morgan');
const tourRoutes = require('./routes/tourRoutes');
const userRoutes = require('./routes/userRoutes');
const AppError = require('./utils/app-error');
const { handleGlobalError } = require('./controllers/errorController');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);

app.all('*', (req, res, next) => {
  const err = new AppError(`Cannot find ${req.method} ${req.originalUrl}`, 404);
  next(err);
});

app.use(handleGlobalError);

module.exports = app;
