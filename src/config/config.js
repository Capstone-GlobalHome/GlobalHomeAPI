import { environment } from './environment'
module.exports = {
  "development": {
    "username": environment.DB_USERNAME,
    "password": environment.DB_PASSWORD,
    "database": environment.DB_NAME,
    "host": environment.DB_HOST,
    "dialect": environment.DB_CONNECTION,
    "operatorsAliases": 1,
    "logging": false
  },
  "test": {
    "username": environment.DB_USERNAME,
    "password": environment.DB_PASSWORD,
    "database": environment.DB_NAME,
    "host": environment.DB_HOST,
    "dialect": environment.DB_CONNECTION,
    "operatorsAliases": 1,
    "logging": false
  },
  "production": {
    "username": environment.DB_USERNAME,
    "password": environment.DB_PASSWORD,
    "database": environment.DB_NAME,
    "host": environment.DB_HOST,
    "dialect": environment.DB_CONNECTION,
    "operatorsAliases": 1,
    "logging": false
  }
}