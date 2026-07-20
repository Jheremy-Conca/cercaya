const { Resena, FotoResena, Usuario, Lugar } = require('../models');
const cloudinary = require('../config/cloudinary');

const crearResena = async (req, res) => {
  try {
    const { lugar_id, rating, comentario } = req.body;

    if (!lugar_id || !rating) {
      return res.status(400).json({ mensaje: 'lugar_id y rating son obligatorios.' });
    }

    const lugar = await Lugar.findByPk(lugar_id);
    if (!lugar) {
      return res.status(404).json({ mensaje: 'El lugar no existe.' });
    }

    const yaExiste = await Resena.findOne({
      where: { lugar_id, usuario_id: req.usuario.id },
    });
    if (yaExiste) {
      return res.status(409).json({ mensaje: 'Ya dejaste una reseña para este lugar.' });
    }

    const nuevaResena = await Resena.create({
      lugar_id,
      usuario_id: req.usuario.id,
      rating,
      comentario,
    });

    if (req.files && req.files.length > 0) {
      const fotos = await Promise.all(
        req.files.map((file) =>
          FotoResena.create({ resena_id: nuevaResena.id, url: file.path })
        )
      );
      nuevaResena.dataValues.fotos = fotos;
    }

    res.status(201).json({ mensaje: 'Reseña creada correctamente.', resena: nuevaResena });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear la reseña.', error: error.message });
  }
};

const listarResenasPorLugar = async (req, res) => {
  try {
    const { lugarId } = req.params;

    const resenas = await Resena.findAll({
      where: { lugar_id: lugarId },
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'avatar'] },
        { model: FotoResena, as: 'fotos', attributes: ['id', 'url'] },
      ],
      order: [['creado_en', 'DESC']],
    });

    res.json({ resenas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al listar reseñas.', error: error.message });
  }
};

// NUEVO: reseñas del usuario logueado, con el lugar al que pertenecen
const obtenerMisResenas = async (req, res) => {
  try {
    const resenas = await Resena.findAll({
      where: { usuario_id: req.usuario.id },
      include: [
        { model: Lugar, as: 'lugar', attributes: ['id', 'nombre', 'categoria'] },
        { model: FotoResena, as: 'fotos', attributes: ['id', 'url'] },
      ],
      order: [['creado_en', 'DESC']],
    });

    res.json({ resenas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener tus reseñas.', error: error.message });
  }
};

const editarResena = async (req, res) => {
  try {
    const { id } = req.params;
    const resena = await Resena.findByPk(id);

    if (!resena) {
      return res.status(404).json({ mensaje: 'Reseña no encontrada.' });
    }
    if (resena.usuario_id !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tienes permiso para editar esta reseña.' });
    }

    const { rating, comentario } = req.body;
    await resena.update({
      rating: rating !== undefined ? Number(rating) : resena.rating,
      comentario: comentario ?? resena.comentario,
    });

    if (req.files && req.files.length > 0) {
      await Promise.all(
        req.files.map((file) =>
          FotoResena.create({ resena_id: resena.id, url: file.path })
        )
      );
    }

    const resenaActualizada = await Resena.findByPk(id, {
      include: [{ model: FotoResena, as: 'fotos', attributes: ['id', 'url'] }],
    });

    res.json({ mensaje: 'Reseña actualizada correctamente.', resena: resenaActualizada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar la reseña.', error: error.message });
  }
};
const eliminarResena = async (req, res) => {
  try {
    const { id } = req.params;
    const resena = await Resena.findByPk(id, {
      include: [{ model: FotoResena, as: 'fotos' }],
    });

    if (!resena) {
      return res.status(404).json({ mensaje: 'Reseña no encontrada.' });
    }
    if (resena.usuario_id !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tienes permiso para eliminar esta reseña.' });
    }

    for (const foto of resena.fotos) {
      const publicId = foto.url.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.uploader.destroy(`cercaya/resenas/${publicId}`).catch(() => {});
    }

    await FotoResena.destroy({ where: { resena_id: resena.id } });
    await resena.destroy();

    res.json({ mensaje: 'Reseña eliminada correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar la reseña.', error: error.message });
  }
};

module.exports = {
  crearResena,
  listarResenasPorLugar,
  obtenerMisResenas,
  editarResena,
  eliminarResena,
};