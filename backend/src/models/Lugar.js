const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Usuario = require('./Usuario');

const Lugar = sequelize.define('Lugar', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  direccion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Guardamos lat/lng como columnas normales para facilidad de lectura
  latitud: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: false,
  },
  longitud: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: false,
  },
  // La columna geoespacial real la crearemos aparte vía SQL (ver Paso 4c)
  creado_por: {
    type: DataTypes.INTEGER,
    references: {
      model: Usuario,
      key: 'id',
    },
  },
}, {
  tableName: 'lugares',
  timestamps: true,
  createdAt: 'creado_en',
  updatedAt: 'actualizado_en',
});

Lugar.belongsTo(Usuario, { foreignKey: 'creado_por', as: 'autor' });

module.exports = Lugar;