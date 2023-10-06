const httpConstants = require('http2').constants;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const UnauthorizedError = require('../errors/unauthorized-error');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const ConflictError = require('../errors/conflict-error');
const {
  inputDataIncorrect,
  emailAlreadyExists,
  userNotFound,
  passwordIsIncorrect,
  success,
} = require('../utils/messages');

const SALT_ROUNDS = 10;
const { JWT_SECRET = 'SECRET_KEY' } = process.env;

const createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;
  bcrypt
    .hash(password, SALT_ROUNDS)
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => {
      const userResponse = user.toObject();
      delete userResponse.password;
      res.status(httpConstants.HTTP_STATUS_CREATED).send(userResponse);
    })
    .catch((err) => {
      if (err.name === 'MongoServerError' && err.code === 11000) {
        return next(new ConflictError(emailAlreadyExists));
      }
      if (err.name === 'ValidationError') {
        return next(new BadRequestError(inputDataIncorrect));
      }
      return next(err);
    });
};

const updateUserProfile = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true, runValidators: true },
  )
    .orFail(() => new NotFoundError(userNotFound))
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError(inputDataIncorrect));
      }
      if (err.name === 'MongoServerError') {
        return next(new BadRequestError(inputDataIncorrect));
      }
      return next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .orFail(() => new UnauthorizedError(userNotFound))
    .then((user) => {
      bcrypt.compare(password, user.password, (err, isValidPassword) => {
        if (!isValidPassword) {
          return next(new UnauthorizedError(passwordIsIncorrect));
        }
        const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        return res.cookie('jwt', token, {
          maxAge: 3600000,
          httpOnly: true,
        }).send({ message: success })
          .end();
      });
    })
    .catch((err) => {
      next(err);
    });
};

const getCurrentUserById = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => new NotFoundError(userNotFound))
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = {
  createUser,
  updateUserProfile,
  login,
  getCurrentUserById,
};
