const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.param('id', userController.checkUserId);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.get('/stats', userController.getUserStatistic);
router.post('/signup', userController.createUser);
router.post('/login', userController.login);

router.post('/forgot-password', userController.forgotPassword);
router.patch('/reset-password/:token', userController.resetPassword);
router.patch(
  '/update-password',
  userController.auth,
  userController.updatePassword
);
router.patch(
  '/update-profile',
  userController.auth,
  userController.updateProfile
);
router
  .route('/:id')
  .get(userController.getOneUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
