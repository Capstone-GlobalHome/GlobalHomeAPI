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
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    name: DataTypes.STRING,
    identifier: DataTypes.STRING,
    image: DataTypes.STRING,
    isParent: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    position: DataTypes.INTEGER,
    thing_type: DataTypes.STRING,
    parent_id: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'thing',
  });
  return thing;
};