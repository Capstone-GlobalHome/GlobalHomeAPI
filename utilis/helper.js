const express = require("express");
var jwt = require("jsonwebtoken");
var config = require("../config/config");
const _ = require("lodash");
var uuid = require("uuid");
const moment = require("moment-timezone");

//validateToken
exports.tokenVerify = function (req, res, next) {
  jwt.verify(req.headers["x-access-token"], process.env.API_KEY, function (err, authData) {
    req.userId = err ? null : authData.id;
    req.username = err ? null : authData.username;
    req.jwtError = err ? err : null;
    next();
  });
};

exports.auth = function (req, res, next) {
  req.auth = {
    check: function () {
      return !!req.userId;
    },
  };
  next();
};

//authRequired
exports.validateToken = function (req, res, next) {
  if (req.auth.check()) {
    next();
  } else {
    res.status(401).json({
      status: "error",
      message: [{ error: req.jwtError && req.jwtError.message == "jwt expired" ? req.jwtError.message : "Could not validate the token" }],
      data: null,
    });
  }
};

// simple Error constructor for handling HTTP error codes
exports.HTTPError = function (statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

exports.createTokens = function (userId, username, secret, secret2) {
  // return createTokens(user, secret,secret2);
  const createToken = jwt.sign({ id: userId, username: username }, secret, { expiresIn: config.jwtExpiryTime });

  const createRefreshToken = jwt.sign({ id: userId, username: username }, secret2, { expiresIn: config.refreshExpiryTime });

  var newToken = {
    token: createToken,
    refreshToken: createRefreshToken,
  };

  return newToken;
};

async function createTokens(userId, username, secret, secret2) {
  const createToken = jwt.sign({ id: userId, username: username }, secret, { expiresIn: config.jwtExpiryTime });

  const createRefreshToken = jwt.sign({ id: userId, username: username }, secret2, { expiresIn: config.refreshExpiryTime });
  var newToken = {
    token: createToken,
    refreshToken: createRefreshToken,
  };
  return newToken;
}
