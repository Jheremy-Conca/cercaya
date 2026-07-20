const { verificarToken } = require('../utils/jwt');

const protegerRuta = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'No autorizado. Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verificarToken(token);
    req.usuario = payload; // disponible en los siguientes controladores
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado.' });
  }
};

module.exports = { protegerRuta };