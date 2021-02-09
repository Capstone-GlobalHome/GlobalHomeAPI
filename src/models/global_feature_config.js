'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class global_feature_config extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      global_feature_config.hasMany(
        global_feature_config,
        {
          as: "child",
          foreignKey: 'parentId',
          onDelete: "cascade"
        }
      )
    }
  };
  global_feature_config.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    title: DataTypes.STRING,
    identifier: DataTypes.STRING,
    image: DataTypes.STRING,
    position: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    isParent: DataTypes.BOOLEAN,
    parentId: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'global_feature_config',
  });
  return global_feature_config;
};