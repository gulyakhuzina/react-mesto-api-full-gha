const express = require('express');

const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');

const cookieParser = require('cookie-parser');

const { PORT = 3000 } = process.env;
const { celebrate, Joi, errors } = require('celebrate');
const { userRoute, cardRoute } = require('./routes/index');
const {
  createUser, login,
} = require('./controllers/users');
const auth = require('./middlewares/auth');
const handleErrors = require('./middlewares/handleErrors');
const NotFoundError = require('./errors/not_found_err');
const { requestLogger, errorLogger } = require('./middlewares/logger');

// eslint-disable-next-line no-useless-escape
const reg = /https?:\/\/w{0,3}[\w\-\.~:/?#\[\]@!$&'\(\)*\+,;=]*\#?$/mi;

const allowedCors = [
  'http://localhost:3001',
  'https://mesto.khuzinagulya.nomoredomains.monster',
];

const corsOptions = {
  origin: allowedCors,
  methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

mongoose.connect('mongodb://127.0.0.1:27017/mestodb', { useNewUrlParser: true });

app.use(cookieParser());

app.use(cors(corsOptions));
app.use(express.json());

app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().regex(reg),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);

app.use(auth);

app.use('/users', auth, userRoute);
app.use('/cards', auth, cardRoute);

app.use(errorLogger);

app.use('*', (req, res, next) => next(new NotFoundError('Страница не найдена')));

app.use(errors());

app.use(handleErrors);

app.listen(PORT);