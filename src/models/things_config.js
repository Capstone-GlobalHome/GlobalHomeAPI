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
    }
  };
  things_config.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    thing_id: DataTypes.STRING,
    identifier: DataTypes.STRING,
    index: DataTypes.STRING,
    url: DataTypes.STRING,
    command_protocol: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'things_config',
  });
  return things_config;
};