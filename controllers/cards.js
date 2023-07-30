const Card = require('../models/card');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ServerError = require('../errors/ServerError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.getCards = (req, res, next) => {
  Card
    .find({})
    .then((cards) => res.send(cards))
    .catch((err) => next(err));
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user.id })
    .then((card) => {
      res.status(201).send(card);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Указаны некорректные данные'));
      }
      return next(err);
    });
};

// eslint-disable-next-line consistent-return
module.exports.deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.cardId);
    if (!card) {
      return next(new NotFoundError('Карточка не найдена.'));
    }

    if (!card.owner.equals(req.user.id)) {
      return next(new ForbiddenError('нельзя удалять чужие карточки'));
    }
    await Card.findByIdAndDelete(req.params.cardId);
    return res.status(200).send(card);
  } catch (err) {
    if (err.name === 'CastError') {
      next(new BadRequestError('некорректные данные.'));
    } else {
      next(err);
    }
  }
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user.id } },
    { new: true },
  )
    .then((cardData) => {
      if (!cardData) {
        return next(new NotFoundError('Ничего не найден'));
      }
      return res.status(200).send(cardData);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Неверный запрос'));
      }
      return next(new ServerError('Ошибка сервера'));
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user.id } },
    { new: true },
  )
    .then((cardData) => {
      if (!cardData) {
        return next(new NotFoundError('Ничего не найден'));
      }
      return res.status(200).send(cardData);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Неверный запрос'));
      }
      return next(err);
    });
};
