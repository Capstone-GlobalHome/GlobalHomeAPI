'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class room extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      room.belongsTo(models.unit,{
        foreignKey: 'fk_unit_id'
      })
      room.hasMany(models.thing,{
        foreignKey: 'fk_room_id',
        onDelete: 'cascade'
      })
    }
  };
  room.init({
    nick_name: DataTypes.STRING,
    type: DataTypes.STRING,
    physical_location: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'room',
  });
  return room;
};