'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class thing_temp_val extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  thing_temp_val.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    thing_id: DataTypes.STRING,
    target: DataTypes.STRING,
    value: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'thing_temp_val',
  });
  return thing_temp_val;
};