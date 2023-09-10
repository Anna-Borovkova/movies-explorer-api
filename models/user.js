const validator = require('validator');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [2, 'Минимальная длина поля name - 2'],
    maxLength: [30, 'Максимальная длина поля name - 30'],
  },
  email: {
    type: String,
    unique: [true, 'Email уже зарегистрирован'],
    required: [true, 'Поле email должно быть заполнено'],
    validate: {
      validator: (v) => validator.isEmail(v),
      message: 'Некорректный email',
    },
  },
  password: {
    type: String,
    required: [true, 'Поле password должно быть заполнено'],
    select: false,
  },
}, { versionKey: false });

module.exports = mongoose.model('user', userSchema);
