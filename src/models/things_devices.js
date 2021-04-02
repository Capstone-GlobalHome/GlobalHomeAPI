'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class things_devices extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  things_devices.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    thing_id: DataTypes.UUID,
    identifier: DataTypes.STRING,
    props: DataTypes.TEXT,
    serverUrl: DataTypes.STRING,
    command_protocal: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'things_devices',
  });
  return things_devices;
};