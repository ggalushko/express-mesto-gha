const bcrypt = require('bcrypt');
const User = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const AuthError = require('../errors/AuthError');
const ConflictError = require('../errors/ConflictError');
const ServerError = require('../errors/ServerError');

const { jwtToken } = require('../middlewares/auth');

const saltRounds = 10;

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => { throw new ServerError('Ошибка сервера'); });
};

module.exports.getUser = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Неверный запрос');
      }
      throw new ServerError('Ошибка сервера');
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  if (!password || !email) {
    res.send({ message: 'Введены не все данные' });
  }

  bcrypt.hash(password, saltRounds).then((hash) => {
    User.create({
      name, about, avatar, email, password: hash,
    })
      .then((user) => {
        const userData = {
          name: user.name,
          about: user.about,
          avatar: user.avatar,
          email: user.email,
          _id: user._id,
        };
        res.send({ data: userData });
      })
      .catch((err) => {
        if (err.code === 11000) {
          next(new ConflictError('Вы уже зарегистрированы'));
        } else if (err.name === 'ValidationError') {
          throw new BadRequestError('Неверный запрос');
        }
        throw new ServerError('Ошибка сервера');
      });
  }).catch((err) => {
    next(err);
  });
};

module.exports.updateUserInfo = (req, res) => {
  const { name, about } = req.body;
  const userId = req.user._id;

  User.findByIdAndUpdate(
    userId,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Неверный запрос');
      }
      throw new ServerError('Ошибка сервера');
    });
};

module.exports.updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  const userId = req.user._id;

  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Неверный запрос');
      }
      throw new ServerError('Ошибка сервера');
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        throw new BadRequestError('Неверный запрос');
      }

      const passwordValid = bcrypt.compare(password, user.password);

      return Promise.all([passwordValid, user]);
    })
    .then(([passwordIsValid, user]) => {
      if (!passwordIsValid) {
        throw new AuthError('Ошибка авторизации');
      }
      return jwtToken({ id: user._id });
    })
    .then((token) => res.send({ token }))
    .catch((err) => {
      next(err);
    });
};
