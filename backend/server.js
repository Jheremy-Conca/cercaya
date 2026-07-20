const app = require('./src/app');
const { sequelize } = require('./src/models'); // 👈 cambio aquí
const { testConnection } = require('./src/config/db');

const PORT = process.env.PORT || 3000;

const iniciarServidor = async () => {
  await testConnection();

  try {
      await sequelize.sync();
    console.log('✅ Modelos sincronizados con la base de datos.');
  } catch (error) {
    console.error('❌ Error al sincronizar modelos:', error.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
};

iniciarServidor();