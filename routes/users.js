const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { regExpEmail } = require('../utils/constants');
const {
  updateUserProfile,
  getCurrentUserById,
} = require('../controllers/users');

router.get('/users/me', getCurrentUserById);

router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().regex(regExpEmail),
  }),
}), updateUserProfile);

module.exports = router;
