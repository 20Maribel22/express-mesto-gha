const { NODE_ENV, JWT_SECRET } = process.env;

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const UnauthorizedError = require('../errors/UnauthorizedError');
const ConflictError = require('../errors/ConflictError');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ServerError = require('../errors/ServerError');
const SECRET_CODE = require('../utils/config');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => next(new ServerError('Произошла внутренняя ошибка сервера')));
};

module.exports.getAboutUser = (req, res, next) => {
  User.findById(req.user_id)
    .then((user) => {
      if (user) {
        res.send({ data: user });
      } else {
        throw new NotFoundError('Пользователь по указанному id не найден');
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Неправильный, некорректный запрос'));
      } else {
        next(new ServerError('Произошла внутренняя ошибка сервера'));
      }
    });
};

module.exports.getUserId = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user) {
        res.send({ data: user });
      } else {
        throw new NotFoundError('Пользователь по указанному id не найден');
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Неправильный, некорректный запрос'));
      } else {
        next(new ServerError('Произошла внутренняя ошибка сервера'));
      }
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;
  bcrypt.hash(password, 10).then((hash) => {
    User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    })
      .then((user) => {
        if (!user) {
          throw new BadRequestError('Неправильный, некорректный запрос');
        }
        return res.status(200).send({
          data: {
            name,
            about,
            avatar,
            email,
          },
        });
      })
      .catch((err) => {
        if (err.code === 11000) {
          next(new ConflictError('Пользователь с такими данными уже зарегистрирован!'));
        } else if (err.name === 'ValidationError') {
          next(new BadRequestError('Неправильный, некорректный запрос'));
        } else {
          next(new ServerError('Произошла внутренняя ошибка сервера'));
        }
      });
  });
};

module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;
  const userId = req.user._id;

  User.findByIdAndUpdate(userId, { name, about }, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (user) {
        res.send({ data: user });
      } else {
        throw new NotFoundError('Пользователь по указанному id не найден');
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Неправильный, некорректный запрос'));
      } else {
        next(new ServerError('Произошла внутренняя ошибка сервера'));
      }
    });
};

module.exports.updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const userId = req.user._id;

  User.findByIdAndUpdate(userId, { avatar }, {
    new: true, runValidators: true,
  })
    .then((user) => {
      if (user) {
        res.send({ data: user });
      } else {
        throw new NotFoundError('Пользователь по указанному id не найден');
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Неправильный, некорректный запрос'));
      } else {
        next(new ServerError('Произошла внутренняя ошибка сервера'));
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Неправильные почта или пароль');
      }
      // сравниваем переданный пароль и хеш из базы
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          throw new UnauthorizedError('Неправильные почта или пароль');
        }
        return user;
      });
    })
    .then((user) => {
      // создадим токен
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : SECRET_CODE, { expiresIn: '7d' });
      res.cookie('jwt', token, {
        // token - наш JWT токен, который мы отправляем
        maxAge: 3600000 * 24,
        httpOnly: true,
      })
        .status(200).send({ message: 'Успешная авторизация!' });
    })
    .catch(() => next(new ServerError('Произошла внутренняя ошибка сервера')));
};
