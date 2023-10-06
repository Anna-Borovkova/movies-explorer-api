const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-error');

const { JWT_SECRET = 'SECRET_KEY' } = process.env;
const { needAuthorization } = require('../utils/messages');

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    next(new UnauthorizedError(needAuthorization));
  }
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    next(new UnauthorizedError(needAuthorization));
  }

  req.user = payload;

  next();
};
