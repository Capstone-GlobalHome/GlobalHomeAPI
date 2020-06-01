const bcrypt = require("bcrypt");
const Sequelize = require("sequelize");
const _ = require("lodash");

module.exports = (sequelize, DataTypes) => {
  var userSchema = sequelize.define(
    "users",
    {
      id: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        field: "id",
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "name",
        validate: {
          len: {
            args: [1, 50],
            msg: "Name must be in between 1 to 50 characters in length.",
          },
        },
      },
      username: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        field: "username",
        validate: {
          len: {
            args: [3, 20],
            msg: "Username must be in between 3 to 20 characters in length.",
          },
        },
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          isEmail: true,
        },
        unique: {
          args: true,
          msg: "Email address already in use!",
        },
        field: "email",
        validate: {
          isEmail: function (value) {
            if (!/^[\-0-9a-zA-Z\.\+_]+@[\-0-9a-zA-Z\.\+_]+\.[a-zA-Z]{2,}$/.test(String(value))) {
              throw new Error("Email is not valid.");
            }
          },
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "password",
        validate: {
          len: {
            args: 8,
            msg: "Password must be atleast 8 characters in length.",
          },
        },
      },
      rememberToken: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "remember_token",
      },
      notifications: {
        type: DataTypes.INTEGER(3).UNSIGNED,
        allowNull: false,
        defaultValue: "0",
        field: "push_notifications",
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "last_login",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "created_at",
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "updated_at",
      },
    },
    {
      tableName: "users",
      timestamps: true,
      underscored: true,
    }
  );

  return userSchema;
};
