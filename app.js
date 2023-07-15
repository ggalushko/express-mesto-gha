const mongoose = require('mongoose');
const express = require('express');

const userRouter = require('./routes/users');
const cardRouter = require('./routes/cards');

const { PORT = 3000 } = process.env;
const app = express();

app.use(express.json());
app.use((req, res, next) => {
  req.user = {
    _id: '5d8b8592978f8bd833ca8133', // вставьте сюда _id созданного в предыдущем пункте пользователя
  };

  next();
});

app.use('/users', userRouter);
app.use('/cards', cardRouter);

mongoose.connect('mongodb://localhost:27017/mestodb').then(() => app.listen(PORT));
