const jwt = require('jsonwebtoken');
const AuthError = require('../errors/AuthError');

const secretKey = 'yandex';

module.exports.auth = (req, res, next) => {
  let token;

  try {
    token = req.cookies.jwt;
  } catch (err) {
    next(new AuthError('Вы не авторизованы'));
  }

  let payload;

  try {
    payload = jwt.verify(token, secretKey);
  } catch (err) {
    next(new AuthError('Вы не авторизованы'));
  }
  req.user = payload;

  next();
};
