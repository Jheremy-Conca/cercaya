const express = require('express');
const router = express.Router();
const {
  crearLugar,
  listarLugares,
  obtenerLugar,
  editarLugar,
  eliminarLugar,
  lugaresCercanos,
} = require('../controllers/lugarController');
const { protegerRuta } = require('../middlewares/authMiddleware');

// Rutas públicas
router.get('/cercanos', lugaresCercanos); // debe ir ANTES de /:id
router.get('/', listarLugares);
router.get('/:id', obtenerLugar);

// Rutas protegidas
router.post('/', protegerRuta, crearLugar);
router.put('/:id', protegerRuta, editarLugar);
router.delete('/:id', protegerRuta, eliminarLugar);

module.exports = router;