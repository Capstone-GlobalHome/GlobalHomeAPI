module.exports = {
  jwtExpiryTime: process.env.JWT_EXPIRY_TIME || 60 * 60 * 8, // Expiry time in seconds
  resetPasswordTokenTime: 3600000, //1hour
  refreshExpiryTime: process.env.REFRESH_EXPIRY_TIME || "7d",
  port: process.env.PORT || 4000,
  senderMailId: "harpreet.iosdev@gmail.com",
  senderPassword: "",
};
