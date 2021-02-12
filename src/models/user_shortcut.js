'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user_shortcut extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user_shortcut.belongsTo(models.global_feature_config, {
        foreignKey: 'fk_feature_id',
        as: 'user_feature',
        onDelete: "cascade"
      })
     
    }
  };
  user_shortcut.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    userId: {
      type: DataTypes.STRING
    },
    access_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    title: DataTypes.STRING,
    identifier: DataTypes.STRING,
    image: DataTypes.STRING,
    isParent: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'user_shortcut',
  });
  return user_shortcut;
};