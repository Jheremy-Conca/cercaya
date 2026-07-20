const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { Usuario } = require('../models');
const { generarToken } = require('../utils/jwt');
const transporter = require('../config/email');

const registrar = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }

    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(409).json({ mensaje: 'Ese correo ya está registrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const nuevoUsuario = await Usuario.create({ nombre, email, password_hash });

    const token = generarToken({ id: nuevoUsuario.id, email: nuevoUsuario.email });

    res.status(201).json({
      mensaje: 'Usuario registrado correctamente.',
      token,
      usuario: { id: nuevoUsuario.id, nombre: nuevoUsuario.nombre, email: nuevoUsuario.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al registrar el usuario.', error: error.message });
  }
};

const iniciarSesion = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios.' });
    }

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValido) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
    }

    const token = generarToken({ id: usuario.id, email: usuario.email });

    res.json({
      mensaje: 'Sesión iniciada correctamente.',
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al iniciar sesión.', error: error.message });
  }
};

// NUEVO: solicita el enlace de recuperación
const olvidePassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ mensaje: 'El correo es obligatorio.' });
    }

    const usuario = await Usuario.findOne({ where: { email } });

    // Si el usuario no existe, respondemos igual (no revelamos si el correo está registrado)
    if (usuario) {
      const tokenPlano = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(tokenPlano).digest('hex');

      usuario.reset_password_token = tokenHash;
      usuario.reset_password_expira = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
      await usuario.save();

      const urlReset = `${process.env.FRONTEND_URL}/restablecer-password/${tokenPlano}`;

      await transporter.sendMail({
        from: `"CercaYa" <${process.env.EMAIL_USER}>`,
        to: usuario.email,
        subject: 'Recupera tu contraseña - CercaYa',
        html: `
          <p>Hola ${usuario.nombre},</p>
          <p>Recibimos una solicitud para restablecer tu contraseña. Este enlace expira en 30 minutos:</p>
          <p><a href="${urlReset}">Restablecer mi contraseña</a></p>
          <p>Si no fuiste tú, puedes ignorar este correo.</p>
        `,
      });
    }

    res.json({ mensaje: 'Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al procesar la solicitud.', error: error.message });
  }
};

// NUEVO: aplica la nueva contraseña usando el token del correo
const restablecerPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const usuario = await Usuario.findOne({
      where: {
        reset_password_token: tokenHash,
        reset_password_expira: { [Op.gt]: new Date() },
      },
    });

    if (!usuario) {
      return res.status(400).json({ mensaje: 'El enlace es inválido o ya expiró.' });
    }

    const salt = await bcrypt.genSalt(10);
    usuario.password_hash = await bcrypt.hash(password, salt);
    usuario.reset_password_token = null;
    usuario.reset_password_expira = null;
    await usuario.save();

    res.json({ mensaje: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al restablecer la contraseña.', error: error.message });
  }
};

module.exports = { registrar, iniciarSesion, olvidePassword, restablecerPassword };