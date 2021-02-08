'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class thing_mapping_config
    extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  thing_mapping_config.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    identifier: DataTypes.STRING,
    target_function: DataTypes.STRING,
    command: DataTypes.STRING,
    argument_type:DataTypes.STRING,
    return_type:DataTypes.STRING,
    read_or_write:DataTypes.STRING,
    name_space: DataTypes.STRING,
    executing_command: DataTypes.STRING,
    order:DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'thing_mapping_config',
  });
  return thing_mapping_config;
};