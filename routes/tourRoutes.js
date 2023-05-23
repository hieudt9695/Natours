const express = require('express');
const fs = require('fs');
const path = require('path');

const tourPath = path.join(__dirname, 'dev-data', 'data', 'tours-simple.json');

const tours = JSON.parse(fs.readFileSync(tourPath));

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

const createTour = (req, res) => {
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

const getTourById = (req, res) => {
  const { id } = req.params;
  const foundTour = tours.find((item) => item.id.toString() === id);

  if (!foundTour)
    return res.status(404).json({
      status: 'fail',
      message: 'Tour not found',
    });

  return res.json({
    status: 'success',
    data: {
      tour: foundTour,
    },
  });
};

const updateTour = (req, res) => {
  res.json({
    status: 'success',
    data: {
      tour: '<updated tour>',
    },
  });
};

const deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

const router = express.Router();

router.route('/').get(getAllTours).post(createTour);

router.route('/:id').get(getTourById).patch(updateTour).delete(deleteTour);

module.exports = router;
