const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ConflictError = require('../errors/conflict-err');

const { NODE_ENV, JWT_SECRET } = process.env;

const OK = 201;

function findById(req, res, next, userId) {
  User.findById(userId)
    .orFail()
    .then((user) => {
      res.send(user);
    })
    .catch(next);
}

function updateInfo(req, res, next, info) {
  User.findByIdAndUpdate(req.user._id, info, { new: true, runValidators: true })
    .orFail()
    .then((user) => {
      res.send(user);
    })
    .catch(next);
}

const getUsers = (req, res, next) => {
  User.find()
    .then((users) => {
      res.send(users);
    })
    .catch(next);
};

const getUser = (req, res, next) => {
  const { userId } = req.params;
  findById(req, res, next, userId);
};

const createUser = (req, res, next) => {
  const {
    name, avatar, about, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, avatar, about, email, password: hash,
    }))
    .then((user) => {
      res.status(OK).send(user);
    })
    .catch((error) => {
      if (error.code === 11000) {
        return next(new ConflictError('Такой email уже существует'));
      }
      return next(error);
    });
};

const updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  updateInfo(req, res, next, { name, about });
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  updateInfo(req, res, next, { avatar });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key',
        { expiresIn: '7d' },
      );
      res
        .cookie('jwt', token, {
          // token - наш JWT токен, который мы отправляем
          maxAge: 3600000,
          httpOnly: true,
        });
      res.send({ token });
    })
    .catch(next);
};

const getCurrentUser = (req, res, next) => {
  const userId = req.user._id;
  findById(req, res, next, userId);
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateProfile,
  updateAvatar,
  login,
  getCurrentUser,
};