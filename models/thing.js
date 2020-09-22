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
      thing.belongsTo(models.room, {
        foreignKey: 'fk_room_id'
      })
      thing.hasMany(models.thing, {
        foreignKey: {
          name: 'parent_id',
          allowNull: true
        },
        onDelete: 'cascade',
        as: 'things-groups'
      })
    }
  };
  thing.init({
    name: DataTypes.STRING,
    identifier: DataTypes.STRING,
    image: DataTypes.STRING,
    type: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'thing',
  });
  return thing;
};