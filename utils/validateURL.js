module.exports.validateURL = (value) => {
  if (value !== value.match(/(http|https):\/\/(www\.|)\S+/g).join('')) {
    throw new Error('Некорректная ссылка');
  }
  return value;
};
