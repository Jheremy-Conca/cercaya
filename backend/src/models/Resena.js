const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Usuario = require('./Usuario');
const Lugar = require('./Lugar');

const Resena = sequelize.define('Resena', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 },
  },
  comentario: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  lugar_id: {
    type: DataTypes.INTEGER,
    references: { model: Lugar, key: 'id' },
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    references: { model: Usuario, key: 'id' },
  },
}, {
  tableName: 'resenas',
  timestamps: true,
  createdAt: 'creado_en',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['usuario_id', 'lugar_id'],
      name: 'resena_unica_por_usuario_lugar',
    },
  ],
});

Resena.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
Resena.belongsTo(Lugar, { foreignKey: 'lugar_id', as: 'lugar' });
Lugar.hasMany(Resena, { foreignKey: 'lugar_id', as: 'resenas' });

module.exports = Resena;