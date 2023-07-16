const User = require('../models/user');
const ERRORS = require('../errors/errors');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => res.status(ERRORS.SERVER_ERROR.code).send({ message: ERRORS.SERVER_ERROR.text }));
};

module.exports.getUser = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(ERRORS.NOT_FOUND.code).send({ message: ERRORS.NOT_FOUND.text });
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(ERRORS.BAD_REQUEST.code).send({ message: ERRORS.BAD_REQUEST.text });
      }
      return res.status(ERRORS.SERVER_ERROR.code).send({ message: ERRORS.SERVER_ERROR.text });
    });
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(ERRORS.BAD_REQUEST.code).send({ message: ERRORS.BAD_REQUEST.text });
      }
      return res.status(ERRORS.SERVER_ERROR.code).send({ message: ERRORS.SERVER_ERROR.text });
    });
};

module.exports.updateUserInfo = (req, res) => {
  const { name, about } = req.body;
  const userId = req.user._id;

  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        return res.status(ERRORS.NOT_FOUND.code).send({ message: ERRORS.NOT_FOUND.text });
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(ERRORS.BAD_REQUEST.code).send({ message: ERRORS.BAD_REQUEST.text });
      }
      return res.status(ERRORS.SERVER_ERROR.code).send({ message: ERRORS.SERVER_ERROR.text });
    });
};

module.exports.updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  const userId = req.user._id;

  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        return res.status(ERRORS.NOT_FOUND.code).send({ message: ERRORS.NOT_FOUND.text });
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(ERRORS.BAD_REQUEST.code).send({ message: ERRORS.BAD_REQUEST.text });
      }
      return res.status(ERRORS.SERVER_ERROR.code).send({ message: ERRORS.SERVER_ERROR.text });
    });
};
