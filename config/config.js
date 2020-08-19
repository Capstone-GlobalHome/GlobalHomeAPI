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
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "operatorsAliases": false
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "operatorsAliases": 1,
    "logging": false
  }
}