'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class preset extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  preset.init({
    thing_attribute_name: DataTypes.STRING,
    thing_attribute_value: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'preset',
  });
  return preset;
};