const express = require('express');
const router = express.Router();
const { registrar, iniciarSesion, olvidePassword, restablecerPassword } = require('../controllers/authController');

router.post('/registro', registrar);
router.post('/login', iniciarSesion);
router.post('/olvide-password', olvidePassword);
router.put('/restablecer-password/:token', restablecerPassword);

module.exports = router;