const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

// middleware run when have param "id"
router.param('id', tourController.checkTourID);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTourById)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
