const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { regExpUrl } = require('../utils/constants');

const {
  getMovies,
  createMovie,
  deleteMovieById,
} = require('../controllers/movies');

router.get('/movies', getMovies);
router.post('/movies', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().regex(regExpUrl),
    trailerLink: Joi.string().required().regex(regExpUrl),
    thumbnail: Joi.string().required().regex(regExpUrl),
    movieId: Joi.number().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
}), createMovie);

router.delete('/movies/:movieId', celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().length(24).hex().required(),
  }),
}), deleteMovieById);

module.exports = router;
