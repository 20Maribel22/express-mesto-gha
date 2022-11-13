const userRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const auth = require('../middlewares/auth');

const regex = /^http[s]*:\/\/.+$/;
const {
  getUsers,
  getAboutUser,
  getUserId,
  updateUser,
  updateUserAvatar,
} = require('../controllers/users');

userRouter.get('/users', auth, getUsers);
userRouter.get('/users/me', auth, getAboutUser);

userRouter.get('/users/:userId', auth, celebrate({
  params: Joi.object().keys({
    userId: Joi.string().length(24).hex(),
  }),
}), getUserId);

userRouter.patch('/users/me', auth, celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), updateUser);

userRouter.patch('/users/me/avatar', auth, celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().pattern(regex),
  }),
}), updateUserAvatar);

module.exports = userRouter;
