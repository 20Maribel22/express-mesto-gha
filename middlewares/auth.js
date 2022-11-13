const { NODE_ENV, JWT_SECRET } = process.env;

const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/UnauthorizedError');
const SECRET_CODE = require('../utils/config');

const auth = (req, res, next) => {
  if (!req.cookies.jwt) {
    throw new UnauthorizedError('Необходима авторизация!');
  }
  const token = req.cookies.jwt;
  let payload;

  try {
    // попытаемся верифицировать токен
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : SECRET_CODE);
  } catch (err) {
    // отправим ошибку, если не получилось
    next(new UnauthorizedError('Необходима авторизация!'));
  }
  req.user = payload;// записываем пейлоуд в объект запроса
  next();// пропускаем запрос дальше
};

module.exports = auth;
