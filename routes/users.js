const userRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const regex = /^([-A-Za-z0-9]+.?([A-Za-z0-9]+)?)@([-A-Za-z0-9]+).([A-Za-z0-9]+.?[A-Za-z0-9]+)$/;
const {
  getUsers,
  getAboutUser,
  getUserId,
  updateUser,
  updateUserAvatar,
} = require('../controllers/users');

userRouter.get('/users', getUsers);
userRouter.get('/users/me', getAboutUser);

userRouter.get('/users/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().length(24).hex().required(),
  }),
}), getUserId);

userRouter.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), updateUser);

userRouter.patch('/users/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().pattern(regex),
  }),
}), updateUserAvatar);

module.exports = userRouter;
