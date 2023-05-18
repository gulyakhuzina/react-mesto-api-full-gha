const jwt = require('jsonwebtoken');
const AuthorizedError = require('../errors/auth-err');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  // const { authorization } = req.headers;
  // if (!authorization || !authorization.startsWith('Bearer ')) {
  //   return next(new AuthorizedError('Необходима авторизация'));
  // }
  if (!req.cookies.jwt) {
    return next(new AuthorizedError('Ошибка авторизации'));
  }
  const token = req.cookies.jwt;
  let payload;
  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key');
  } catch (err) {
    return next(new AuthorizedError('Необходима авторизация'));
  }

  req.user = payload;

  return next();
};