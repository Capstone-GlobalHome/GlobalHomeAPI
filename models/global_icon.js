'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class global_icon extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  global_icon.init({
    image_url: DataTypes.STRING,
    label: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'global_icon',
  });
  return global_icon;
};