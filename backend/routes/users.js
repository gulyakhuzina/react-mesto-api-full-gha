const express = require('express');
const { celebrate, Joi } = require('celebrate');

const userRoute = express.Router();
const {
  getUsers, getUser, updateProfile, updateAvatar, getCurrentUser,
} = require('../controllers/users');

userRoute.get('/', getUsers);
userRoute.get('/me', getCurrentUser);
userRoute.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().required().hex().length(24),
  }),
}), getUser);
userRoute.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), updateProfile);
userRoute.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    // eslint-disable-next-line no-useless-escape
    avatar: Joi.string().required().regex(/https?:\/\/w{0,3}[\w\-\.~:/?#\[\]@!$&'\(\)*\+,;=]*\#?$/mi),
  }),
}), updateAvatar);

module.exports = userRoute;