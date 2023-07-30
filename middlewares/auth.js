const jwt = require('jsonwebtoken');
const AuthError = require('../errors/AuthError');

const secretKey = 'yandex';

module.exports.auth = (req, res, next) => {
  let payload;
  const token = req.cookies.jwt;

  if (!token) {
    next(new AuthError('Необходима авторизация'));
  }
  try {
    payload = jwt.verify(token, secretKey);
    req.user = payload;
  } catch (err) {
    next(new AuthError('Необходима авторизация'));
  }

  next();
};
