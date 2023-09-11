const httpConstants = require('http2').constants;
const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const DeleteForbiddenError = require('../errors/delete-forbidden-error');

const getMovies = (req, res, next) => {
  Movie.find()
    .then((movies) => {
      res.send(movies);
    })
    .catch((err) => next(err));
};

const createMovie = (req, res, next) => {
  const {
    country, director, duration, year, description, image, trailerLink, thumbnail,
    movieId, nameRU, nameEN,
  } = req.body;
  const owner = req.user._id;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    owner,
    movieId,
    nameRU,
    nameEN,
  })
    .then((movie) => {
      res.status(httpConstants.HTTP_STATUS_CREATED).send(movie);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Input data incorrect'));
      }
      return next(err);
    });
};

const deleteMovieById = (req, res, next) => {
  const { movieId } = req.params;
  return Movie.findById(movieId)
    .orFail(() => new NotFoundError('Movie not found'))
    .then((checkedMovie) => {
      if (checkedMovie.owner.toString() !== req.user._id) {
        return next(new DeleteForbiddenError('Delete forbidden'));
      }
      return Movie.findByIdAndRemove(movieId)
        .then((removedMovie) => {
          res.send(removedMovie);
        })
        .catch((err) => {
          if (err.name === 'CastError') {
            return next(new BadRequestError('Cast error'));
          }
          return next(err);
        });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Cast error'));
      }
      return next(err);
    });
};

module.exports = {
  getMovies,
  createMovie,
  deleteMovieById,
};
