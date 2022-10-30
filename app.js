const express = require('express');
const mongoose = require('mongoose');
const { constants } = require('http2');
const bodyParser = require('body-parser');

const userRouter = require('./routes/users');
const cardRouter = require('./routes/cards');

const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(bodyParser.json());

// Временное решение, мидлвэр:
app.use((req, res, next) => {
  req.user = {
    _id: '635e3f5384fb4b95f972741b',
  };

  next();
});

app.use('/', userRouter);
app.use('/', cardRouter);

app.use((req, res) => {
  res.status(constants.HTTP_STATUS_NOT_FOUND).send({ message: 'Страница не найдена' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Сервер запущен на порту ${PORT}`);
});
