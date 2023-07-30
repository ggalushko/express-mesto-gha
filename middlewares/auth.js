const jwt = require('jsonwebtoken');
const AuthError = require('../errors/AuthError');

const secretKey = 'yandex';

// eslint-disable-next-line consistent-return
module.exports.auth = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new AuthError('Вы не авторизованы');
  }
  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token, secretKey);
  } catch (err) {
    return next(new AuthError('Вы не авторизованы'));
  }
  req.user = payload;
  next();
};
