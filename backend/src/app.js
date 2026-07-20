const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (fotos subidas)
app.use('/uploads', express.static('uploads'));

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mensaje: 'Servidor funcionando correctamente' });
});

// Rutas (las iremos agregando en los próximos pasos)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/lugares', require('./routes/lugarRoutes'));
app.use('/api/resenas', require('./routes/resenaRoutes'));

module.exports = app;