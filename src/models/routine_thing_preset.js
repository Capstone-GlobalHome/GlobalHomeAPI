'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class routine_thing_preset extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  routine_thing_preset.init({
    name: DataTypes.STRING,
    thing_id: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'routine_thing_preset',
  });
  return routine_thing_preset;
};