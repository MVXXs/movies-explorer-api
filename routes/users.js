const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  updateUserById,
  getCurrentUser,
} = require('../controllers/users');

router.get('/me', getCurrentUser);
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
  }),
}), updateUserById);

module.exports = router;
