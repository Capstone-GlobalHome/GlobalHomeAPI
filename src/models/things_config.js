'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class things_config extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      things_config.belongsTo(models.thing, {
        foreignKey: 'thing_id',
        as: 'thing'
      })
    }
  };
  things_config.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    identifier: DataTypes.STRING,
    index: DataTypes.STRING,
    url: DataTypes.STRING,
    props: DataTypes.TEXT,
    command_protocol: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'things_config',
  });
  return things_config;
};