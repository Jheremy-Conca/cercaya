const { Lugar, Usuario } = require('../models');
const { sequelize } = require('../config/db');

// Fórmula de Haversine en SQL: distancia en metros entre dos puntos lat/lng.
// El LEAST/GREATEST evita errores de dominio en acos() por redondeo de punto flotante.
const FORMULA_DISTANCIA_METROS = `
  6371000 * acos(
    LEAST(1, GREATEST(-1,
      cos(radians(:lat)) * cos(radians(latitud)) *
      cos(radians(longitud) - radians(:lng)) +
      sin(radians(:lat)) * sin(radians(latitud))
    ))
  )
`;

const crearLugar = async (req, res) => {
  try {
    const { nombre, categoria, direccion, descripcion, latitud, longitud } = req.body;

    if (!nombre || !categoria || latitud === undefined || longitud === undefined) {
      return res.status(400).json({
        mensaje: 'nombre, categoria, latitud y longitud son obligatorios.',
      });
    }

    const RADIO_DUPLICADO_METROS = 50;
    const [existente] = await sequelize.query(
      `
      SELECT id, nombre
      FROM lugares
      WHERE LOWER(nombre) = LOWER(:nombre)
        AND ${FORMULA_DISTANCIA_METROS} <= :radio
      LIMIT 1
      `,
      {
        replacements: { nombre, lng: longitud, lat: latitud, radio: RADIO_DUPLICADO_METROS },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (existente) {
      return res.status(409).json({
        mensaje: `Ya existe un lugar llamado "${existente.nombre}" muy cerca de esta ubicación.`,
      });
    }

    const nuevoLugar = await Lugar.create({
      nombre,
      categoria,
      direccion,
      descripcion,
      latitud,
      longitud,
      creado_por: req.usuario.id,
    });

    res.status(201).json({ mensaje: 'Lugar creado correctamente.', lugar: nuevoLugar });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear el lugar.', error: error.message });
  }
};

// Listar todos los lugares (público) — ahora incluye ratingPromedio y totalResenas
const listarLugares = async (req, res) => {
  try {
    const { categoria } = req.query;
    const where = categoria ? { categoria } : {};

    const lugares = await Lugar.findAll({
      where,
      include: [{ model: Usuario, as: 'autor', attributes: ['id', 'nombre'] }],
      attributes: {
        include: [
          [
            sequelize.literal(
              `(SELECT COALESCE(AVG(rating), 0) FROM resenas WHERE resenas.lugar_id = "Lugar"."id")`
            ),
            'ratingPromedio',
          ],
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM resenas WHERE resenas.lugar_id = "Lugar"."id")`
            ),
            'totalResenas',
          ],
        ],
      },
      order: [['creado_en', 'DESC']],
    });

    res.json({ lugares });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al listar lugares.', error: error.message });
  }
};

// Ver detalle de un lugar (público) — mismo cálculo de rating
const obtenerLugar = async (req, res) => {
  try {
    const { id } = req.params;

    const lugar = await Lugar.findByPk(id, {
      include: [{ model: Usuario, as: 'autor', attributes: ['id', 'nombre'] }],
      attributes: {
        include: [
          [
            sequelize.literal(
              `(SELECT COALESCE(AVG(rating), 0) FROM resenas WHERE resenas.lugar_id = "Lugar"."id")`
            ),
            'ratingPromedio',
          ],
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM resenas WHERE resenas.lugar_id = "Lugar"."id")`
            ),
            'totalResenas',
          ],
        ],
      },
    });

    if (!lugar) {
      return res.status(404).json({ mensaje: 'Lugar no encontrado.' });
    }

    res.json({ lugar });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener el lugar.', error: error.message });
  }
};

const editarLugar = async (req, res) => {
  try {
    const { id } = req.params;
    const lugar = await Lugar.findByPk(id);

    if (!lugar) {
      return res.status(404).json({ mensaje: 'Lugar no encontrado.' });
    }

    if (lugar.creado_por !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tienes permiso para editar este lugar.' });
    }

    const { nombre, categoria, direccion, descripcion, latitud, longitud } = req.body;

    const nombreFinal = nombre ?? lugar.nombre;
    const latitudFinal = latitud ?? lugar.latitud;
    const longitudFinal = longitud ?? lugar.longitud;

    const RADIO_DUPLICADO_METROS = 50;
    const [existente] = await sequelize.query(
      `
      SELECT id, nombre
      FROM lugares
      WHERE LOWER(nombre) = LOWER(:nombre)
        AND id != :id
        AND ${FORMULA_DISTANCIA_METROS} <= :radio
      LIMIT 1
      `,
      {
        replacements: {
          nombre: nombreFinal,
          id,
          lng: longitudFinal,
          lat: latitudFinal,
          radio: RADIO_DUPLICADO_METROS,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (existente) {
      return res.status(409).json({
        mensaje: `Ya existe otro lugar llamado "${existente.nombre}" muy cerca de esta ubicación.`,
      });
    }

    await lugar.update({
      nombre: nombreFinal,
      categoria: categoria ?? lugar.categoria,
      direccion: direccion ?? lugar.direccion,
      descripcion: descripcion ?? lugar.descripcion,
      latitud: latitudFinal,
      longitud: longitudFinal,
    });

    res.json({ mensaje: 'Lugar actualizado correctamente.', lugar });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar el lugar.', error: error.message });
  }
};

const eliminarLugar = async (req, res) => {
  try {
    const { id } = req.params;
    const lugar = await Lugar.findByPk(id);

    if (!lugar) {
      return res.status(404).json({ mensaje: 'Lugar no encontrado.' });
    }

    if (lugar.creado_por !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tienes permiso para eliminar este lugar.' });
    }

    await lugar.destroy();
    res.json({ mensaje: 'Lugar eliminado correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar el lugar.', error: error.message });
  }
};

// Buscar lugares cercanos (público) — ahora también con rating real
const lugaresCercanos = async (req, res) => {
  try {
    const { lat, lng, radio } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ mensaje: 'lat y lng son obligatorios.' });
    }

    const radioMetros = radio ? parseFloat(radio) * 1000 : 5000;

    const lugares = await sequelize.query(
      `
      SELECT * FROM (
        SELECT
          id, nombre, categoria, direccion, descripcion, latitud, longitud,
          ${FORMULA_DISTANCIA_METROS} AS distancia_metros,
          COALESCE((SELECT AVG(rating) FROM resenas WHERE resenas.lugar_id = lugares.id), 0) AS "ratingPromedio",
          (SELECT COUNT(*) FROM resenas WHERE resenas.lugar_id = lugares.id) AS "totalResenas"
        FROM lugares
      ) sub
      WHERE distancia_metros <= :radioMetros
      ORDER BY distancia_metros ASC
      `,
      {
        replacements: { lat: parseFloat(lat), lng: parseFloat(lng), radioMetros },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json({ lugares });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al buscar lugares cercanos.', error: error.message });
  }
};

module.exports = {
  crearLugar,
  listarLugares,
  obtenerLugar,
  editarLugar,
  eliminarLugar,
  lugaresCercanos,
};