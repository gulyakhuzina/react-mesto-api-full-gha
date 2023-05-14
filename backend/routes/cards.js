const express = require('express');
const { celebrate, Joi } = require('celebrate');

const cardRoute = express.Router();
const {
  getCards, createCard, deleteCard, likeCard, dislikeCard,
} = require('../controllers/cards');

cardRoute.get('/', getCards);
cardRoute.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    // eslint-disable-next-line no-useless-escape
    link: Joi.string().required().regex(/https?:\/\/w{0,3}[\w\-\.~:/?#\[\]@!$&'\(\)*\+,;=]*\#?$/mi),
  }),
}), createCard);
cardRoute.delete('/:cardId', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required().hex().length(24),
  }),
}), deleteCard);
cardRoute.put('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required().hex().length(24),
  }),
}), likeCard);
cardRoute.delete('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required().hex().length(24),
  }),
}), dislikeCard);

module.exports = cardRoute;