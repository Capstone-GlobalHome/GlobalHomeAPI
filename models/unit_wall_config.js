'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class unit_wall_config extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      unit_wall_config.belongsTo(models.unit, {
        foreignKey: 'fk_unit_id',
        as: 'unit'
      })
    }
  };
  unit_wall_config.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    name: DataTypes.STRING,
    image: DataTypes.STRING,
    animation: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'unit_wall_config',
  });
  return unit_wall_config;
};