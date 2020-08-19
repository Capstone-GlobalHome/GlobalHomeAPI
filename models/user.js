'use strict';
export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    verification_code: { type: DataTypes.INTEGER },
    resend_code_time: { type: DataTypes.INTEGER },
    resend_code_date: { type: DataTypes.DATE },
    forgot_password_date: { type: DataTypes.DATE },
    password: { type: DataTypes.STRING },
    status: { type: DataTypes.INTEGER, defaultValue: 0 }
  }, {});
  User.associate = function (models) {
    // associations can be defined here
  };
  return User;
};