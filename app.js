const express = require('express');
const mongoose = require('mongoose');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');

const { PORT = 3000 } = process.env;
const app = express();
mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use((req, res, next) => {
  req.user = {
    _id: '64b3a06a13f75dc508e2692c',
  };

  next();
});

app.use(express.json());
app.use('/users', usersRouter);
app.use('/cards', cardsRouter);
app.use((req, res) => res.status(404).send({ message: 'Такой страницы нет' }));

app.listen(PORT);
