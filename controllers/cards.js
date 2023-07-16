const Card = require('../models/card');
const ERRORS = require('../errors/errors');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => res.status(ERRORS.SERVER_ERROR.code).send({ message: ERRORS.SERVER_ERROR.text }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(ERRORS.BAD_REQUEST.code).send({ message: ERRORS.BAD_REQUEST.text });
      }
      return res.status(ERRORS.SERVER_ERROR.code).send({ message: ERRORS.SERVER_ERROR.text });
    });
};

module.exports.deleteCard = (req, res) => {
  const { cardId } = req.params;

  Card.findByIdAndRemove(cardId)
    .then((card) => {
      if (!card) {
        return res.status(ERRORS.NOT_FOUND.code).send({ message: ERRORS.NOT_FOUND.text });
      }
      return res.send({ message: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(ERRORS.BAD_REQUEST.code).send({ message: ERRORS.BAD_REQUEST.text });
      }
      return res.status(ERRORS.SERVER_ERROR.code).send({ message: ERRORS.SERVER_ERROR.text });
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
        return res.status(ERRORS.NOT_FOUND.code).send({ message: ERRORS.NOT_FOUND.text });
      }
      return res.send({ data: cardData });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(ERRORS.BAD_REQUEST.code).send({ message: ERRORS.BAD_REQUEST.text });
      }
      return res.status(ERRORS.SERVER_ERROR.code).send({ message: ERRORS.SERVER_ERROR.text });
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
        return res.status(ERRORS.NOT_FOUND.code).send({ message: ERRORS.NOT_FOUND.text });
      }
      return res.send({ data: cardData });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(ERRORS.BAD_REQUEST.code).send({ message: ERRORS.BAD_REQUEST.text });
      }
      return res.status(ERRORS.SERVER_ERROR.code).send({ message: ERRORS.SERVER_ERROR.text });
    });
};
