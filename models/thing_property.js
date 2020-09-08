'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class thing_property extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  thing_property.init({
    serialNumber: DataTypes.STRING,
    rfidTag: DataTypes.STRING,
    buildingId: DataTypes.STRING,
    developmentId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'thing_property',
  });
  return thing_property;
};