require('dotenv').config();

/**
 * Configurazione del database utilizzata da Sequelize.
 */
const config = {
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'parkingdb',
  host: process.env.DB_HOST || 'db',
  port: parseInt(process.env.DB_PORT || '5432'),
  dialect: process.env.DB_DIALECT || 'postgres',
  logging: false,
};

/**
 * Esportazione della configurazione del database per diversi ambienti.
 */
module.exports = {
  development: config,
  test: config,
  production: config,
};
