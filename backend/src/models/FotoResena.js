const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Resena = require('./Resena');

const FotoResena = sequelize.define('FotoResena', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  resena_id: {
    type: DataTypes.INTEGER,
    references: { model: Resena, key: 'id' },
  },
}, {
  tableName: 'fotos_resena',
  timestamps: false,
});

FotoResena.belongsTo(Resena, { foreignKey: 'resena_id', as: 'resena' });
Resena.hasMany(FotoResena, { foreignKey: 'resena_id', as: 'fotos' });

module.exports = FotoResena;