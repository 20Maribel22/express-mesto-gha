const cardRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const regex = /^http[s]*:\/\/.+$/;
const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

cardRouter.get('/cards', getCards);

cardRouter.post('/cards', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().pattern(regex),
  }),
}), createCard);

cardRouter.delete('/cards/:cardId', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().length(24).hex(),
  }),
}), deleteCard);

cardRouter.put('/cards/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().length(24).hex(),
  }),
}), likeCard);

cardRouter.delete('/cards/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().length(24).hex(),
  }),
}), dislikeCard);

module.exports = cardRouter;
