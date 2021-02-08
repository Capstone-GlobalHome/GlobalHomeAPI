'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class unit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      unit.hasMany(models.room, {
        foreignKey: 'fk_unit_id',
        as: 'rooms',
        onDelete: 'cascade'
      })
      unit.hasMany(models.User, {
        foreignKey: 'fk_unit_id',
        as: 'users',
        onDelete: 'cascade'
      })
    }
  };
  unit.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    name: DataTypes.STRING,
    unit_type: DataTypes.STRING,
    property_id: DataTypes.STRING,
    building_id: DataTypes.STRING,
    physical_location: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'unit',
  });
  return unit;
};