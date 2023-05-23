const express = require('express');
const morgan = require('morgan');
const tourRoutes = require

const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);

const port = 3000;

app.listen(port, () => {
  console.log('Listening on port ', port);
});
