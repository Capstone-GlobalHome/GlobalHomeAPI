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
      preset.belongsTo(models.thing, {
        foreignKey: 'fk_thing_id'
      })
    }
  };
  preset.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    name: DataTypes.STRING,
    is_default:DataTypes.INTEGER,
    defaultValue:DataTypes.INTEGER,
    image:DataTypes.STRING,
    position: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'preset',
  });
  return preset;
};