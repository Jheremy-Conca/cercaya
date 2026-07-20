const express = require("express");
const router = express.Router();
const {
  crearResena,
  listarResenasPorLugar,
  obtenerMisResenas,
  editarResena,
  eliminarResena,
} = require("../controllers/resenaController");
const { protegerRuta } = require("../middlewares/authMiddleware");
const { subirFotosResena } = require("../middlewares/uploadMiddleware");

router.get("/lugar/:lugarId", listarResenasPorLugar); // pública
router.post("/", protegerRuta, subirFotosResena, crearResena);
router.put("/:id", protegerRuta, subirFotosResena, editarResena);
router.delete("/:id", protegerRuta, eliminarResena);
router.get("/mias", protegerRuta, obtenerMisResenas);
module.exports = router;
