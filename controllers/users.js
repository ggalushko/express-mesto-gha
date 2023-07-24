const bcrypt = require('bcrypt');
const User = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const AuthError = require('../errors/AuthError');
const ConflictError = require('../errors/ConflictError');
const ServerError = require('../errors/ServerError');

const { jwtToken } = require('../middlewares/auth');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => { next(new ServerError('Ошибка сервера')); });
};

module.exports.getUser = (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        next(new NotFoundError('Пользователь не найден'));
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Неверный запрос'));
      }
      next(new ServerError('Ошибка сервера'));
    });
};

module.exports.getCurrentUser = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .orFail(() => {
      next(new NotFoundError('Пользователь  не найден'));
    })
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Некорректный запрос'));
      } else {
        next(err);
      }
    });
};//

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
        res.status(201).send({ data: userData });
      })
      .catch((err) => {
        if (err.code === 11000) {
          return next(new ConflictError('Вы уже зарегистрированы'));
        } if (err.name === 'ValidationError') {
          return next(new BadRequestError('Неверный запрос'));
        }
        next(new ServerError('Ошибка сервера'));
      });
  }).catch((err) => {
    next(err);
  });
};

module.exports.updateUserInfo = (req, res, next) => {
  const { name, about } = req.body;
  User
    .findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true, runValidators: true },
    )
    .then((user) => {
      if (!user) {
        next(new NotFoundError('Пользователь не найден'));
      }
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(BadRequestError('Введены некорректные данные'));
      } else next(err);
    });
};

module.exports.updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .orFail(() => new NotFoundError('Пользователь не найден'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Введены некорректные данные'));
      } else next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        next(new AuthError('Ошибка авторизации'));
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
