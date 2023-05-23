const express = require('express');

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'This route is not defined yet!',
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'This route is not defined yet!',
  });
};

const getOneUser = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'This route is not defined yet!',
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'This route is not defined yet!',
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'This route is not defined yet!',
  });
};

const router = express.Router();

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getOneUser).patch(updateUser).delete(deleteUser);

module.exports = router;
