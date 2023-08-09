const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {
  STATUS_OK,
  CREATE_OK,
} = require('../utils/status');
const {
  BadRequestError, // 400
  ConflictError, // 409
  NotFoundError, // 404
} = require('../errors/errors');

const { NODE_ENV, JWT_SECRET } = process.env;

const SALT_ROUNDS = 10;

const getCurrentUser = (req, res, next) => {
  const id = req.user._id;

  User.findById(id)
    .then((currentUser) => {
      if (!currentUser) {
        throw new NotFoundError('Пользователь не найден');
      }
      return res.status(STATUS_OK).send(currentUser);
    })
    .catch((err) => {
      next(err);
    });
};

const updateUserById = (req, res, next) => {
  const { name, email } = req.body;
  const id = req.user._id;

  User.findByIdAndUpdate(id, { name, email }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      return res.status(STATUS_OK).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(`${Object.values(err.errors)
          .map((error) => error.message)
          .join(', ')}`));
      } else {
        next(err);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'unique-secret-key', { expiresIn: '7d' });
      res.status(STATUS_OK).send({ token });
    })
    .catch((err) => {
      next(err);
    });
};

const createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;

  bcrypt.hash(password, SALT_ROUNDS)
    .then((hash) => User.create({
      name, email, password: hash,
    }))
    .then(() => {
      res.status(CREATE_OK).send({
        email,
        name,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(`${Object.values(err.errors)
          .map((error) => error.message)
          .join(', ')}`));
      } else if (err.code === 11000) {
        next(new ConflictError('Такой пользователь уже зарегистрирован'));
      } else {
        next(err);
      }
    });
};

module.exports = {
  getCurrentUser,
  updateUserById,
  login,
  createUser,
};
