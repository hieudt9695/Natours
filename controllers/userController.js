exports.getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'This route is not defined yet!',
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'This route is not defined yet!',
  });
};

exports.checkUserId = (req, res, next, val) => {
  console.log('check user id');
  next();
};

exports.getOneUser = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'This route is not defined yet!',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'This route is not defined yet!',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'This route is not defined yet!',
  });
};
