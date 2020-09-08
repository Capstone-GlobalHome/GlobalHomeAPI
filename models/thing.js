'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class thing extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      thing.belongsTo(models.room,{
        foreignKey: 'fk_room_id'
      })
    }
  };
  thing.init({
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    is_group_of_thing: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'thing',
  });
  return thing;
};