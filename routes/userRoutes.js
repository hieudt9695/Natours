const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.param('id', userController.checkUserId);

router
  .route('/')
  .get(userController.auth, userController.getAllUsers)
  .post(userController.createUser);

router.get('/stats', userController.getUserStatistic);
router.post('/signup', userController.createUser);
router.post('/login', userController.login);

router
  .route('/:id')
  .get(userController.getOneUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
