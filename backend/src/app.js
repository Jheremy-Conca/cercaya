const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const origenesPermitidos = [
  process.env.FRONTEND_URL,
  'http://localhost:5173', // para que sigas pudiendo probar en local
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origenesPermitidos.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mensaje: 'Servidor funcionando correctamente' });
});

// Rutas (las iremos agregando en los próximos pasos)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/lugares', require('./routes/lugarRoutes'));
app.use('/api/resenas', require('./routes/resenaRoutes'));

module.exports = app;