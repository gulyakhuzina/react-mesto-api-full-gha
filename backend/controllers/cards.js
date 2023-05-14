const Card = require('../models/card');
const ForbiddenError = require('../errors/forbidden-err');

const OK = 201;

const setLikes = (req, res, setFunction, next) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(
    cardId,
    setFunction,
    { new: true },
  )
    .orFail()
    .populate(['owner', 'likes'])
    .then((card) => {
      res.send({ data: card });
    })
    .catch(next);
};

const getCards = (req, res, next) => {
  Card.find()
    .populate(['owner', 'likes'])
    .then((cards) => {
      res.send({ data: cards });
    })
    .catch(next);
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => card.populate(['owner', 'likes']))
    .then((card) => {
      res.status(OK).send({ data: card });
    })
    .catch(next);
};

const deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  Card.findById(cardId)
    .orFail()
    .populate(['owner', 'likes'])
    .then((card) => {
      if (card.owner._id.toString() === req.user._id) {
        card.deleteOne();
        res.send({ data: card });
      } else throw new ForbiddenError('Доступ запрещен');
    })
    .catch(next);
};

const likeCard = (req, res, next) => {
  setLikes(req, res, { $addToSet: { likes: req.user._id } }, next);
};

const dislikeCard = (req, res, next) => {
  setLikes(req, res, { $pull: { likes: req.user._id } }, next);
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
