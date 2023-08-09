const Movie = require('../models/movie');
const {
  STATUS_OK,
  CREATE_OK,
} = require('../utils/status');
const {
  BadRequestError, // 400
  ForbiddenError, // 403
  NotFoundError, // 404
} = require('../errors/errors');

const getMovies = (req, res, next) => {
  const owner = req.user._id;

  Movie.find({ owner })
    .then((movies) => {
      res.status(STATUS_OK).send(movies);
    })
    .catch((err) => {
      next(err);
    });
};

const createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRu,
    nameEn,
    thumbnail,
    movieId,
  } = req.body;

  return Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRu,
    nameEn,
    thumbnail,
    movieId,
    owner: req.user._id,
  })
    .then((newMovie) => {
      res.status(CREATE_OK).send(newMovie);
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

const deleteMovie = (req, res, next) => {
  const { id } = req.params;

  Movie.findById(id)
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Фильм не найден');
      } else if (!movie.owner.equals(req.user._id)) {
        throw new ForbiddenError('Запрещено удалять чужие фильмы');
      } else {
        movie.deleteOne()
          .then((delMovie) => {
            res.status(STATUS_OK).send(delMovie);
          })
          .catch((err) => {
            next(err);
          });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Bad request'));
      } else {
        next(err);
      }
    });
};

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
