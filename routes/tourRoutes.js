const express = require('express');
const tourController = require('../controllers/tourController');
const userController = require('../controllers/userController');

const router = express.Router();

// middleware run when have param "id"
router.param('id', tourController.checkTourID);

router
  .route('/top')
  .get(tourController.getTopTours, tourController.getAllTours);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour)
  .delete(tourController.deleteAllTours);

router.route('/stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getTourMonthlyPlan);

router
  .route('/:id')
  .get(tourController.getTourById)
  .patch(tourController.updateTour)
  .delete(
    userController.auth,
    userController.restrictTo('admin'),
    tourController.deleteTour
  );

module.exports = router;
