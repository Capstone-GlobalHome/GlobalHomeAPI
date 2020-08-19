import Sequelize from 'sequelize'
import dotenv from 'dotenv'
dotenv.config()

module.exports = new Sequelize(process.env.POSTGRES_DB_DATABASE, process.env.POSTGRES_DB_USERNAME, process.env.POSTGRES_DB_PASSWORD, {
  host: process.env.POSTGRES_DB_HOST,
  dialect: process.env.POSTGRES_DB_CONNECTION,
  operatorsAliases: 1,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
});