const fs = require('fs');
const path = require('path');

const tourPath = path.join(
  process.cwd(),
  'dev-data',
  'data',
  'tours-simple.json'
);

const tours = JSON.parse(fs.readFileSync(tourPath));

exports.checkTourID = (req, res, next, val) => {
  const foundTour = tours.find((item) => item.id.toString() === val);
  if (!foundTour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  req.foundTour = foundTour;
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

exports.createTour = (req, res) => {
  const id = tours[tours.length - 1].id + 1;
  const newTour = { ...req.body, id };
  tours.push(newTour);

  fs.writeFile(tourPath, JSON.stringify(tours), (err) => {
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  });
};

exports.getTourById = (req, res) => {
  return res.json({
    status: 'success',
    data: {
      tour: req.foundTour,
    },
  });
};

exports.updateTour = (req, res) => {
  res.json({
    status: 'success',
    data: {
      tour: '<updated tour>',
    },
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

