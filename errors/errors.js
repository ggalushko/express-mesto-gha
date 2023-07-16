const ERRORS = {
  BAD_REQUEST: {
    code: 400,
    text: 'Введены некорректные данные',
  },
  NOT_FOUND: {
    code: 404,
    text: 'Ничего не найдено',
  },
  SERVER_ERROR: {
    code: 500,
    text: 'ОШИБКА СЕРВЕРА',
  },

};

module.exports = ERRORS;
