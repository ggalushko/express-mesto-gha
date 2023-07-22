const Card = require('../models/card');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ServerError = require('../errors/ServerError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => { throw new ServerError('Ошибка сервера'); });
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Неверный запрос');
      }
      throw new ServerError('Ошибка сервера');
    });
};

module.exports.deleteCard = (req, res) => {
  const { cardId } = req.params;

  Card.findByIdAndRemove(cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Ничего не найдено');
      }
      const owner = card.owner.toString();
      if (owner !== req.user.id) {
        throw new ForbiddenError('Нельзя удалять чужие карточки');
      }
      return res.send({ message: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Неверный запрос');
      }
      throw new ServerError('Ошибка сервера');
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((cardData) => {
      if (!cardData) {
        throw new NotFoundError('Ничего не найден');
      }
      return res.send({ data: cardData });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Неверный запрос');
      }
      throw new ServerError('Ошибка сервера');
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((cardData) => {
      if (!cardData) {
        throw new NotFoundError('Ничего не найден');
      }
      return res.send({ data: cardData });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Неверный запрос');
      }
      throw new ServerError('Ошибка сервера');
    });
};
