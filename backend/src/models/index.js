const { sequelize } = require('../config/db');

const Usuario = require('./Usuario');
const Lugar = require('./Lugar');
const Resena = require('./Resena');
const FotoResena = require('./FotoResena');

module.exports = {
  sequelize,
  Usuario,
  Lugar,
  Resena,
  FotoResena,
};