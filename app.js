require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const router = require('./routes/index');
const errorHandler = require('./middlewares/error-handler');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const app = express();
const { PORT = 3000, MONGODB_URL = 'mongodb://127.0.0.1:27017/moviesdb' } = process.env;

mongoose
  .connect(MONGODB_URL, {
    useNewUrlParser: true,
    autoIndex: true,
  });

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
  credentials: true,
  origin: true,
  maxAge: 30,
}));

app.use(helmet());

app.use(requestLogger); // подключаем логгер запросов

app.use(router);

app.use(errorLogger); // подключаем логгер ошибок

app.use(errors());
app.use(errorHandler);

console.log(process.env.NODE_ENV);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
