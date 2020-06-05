const express = require("express");
var jwt = require("jsonwebtoken");
var config = require("../config/config");
const _ = require("lodash");
var uuid = require("uuid");
const moment = require("moment-timezone");
const fs = require("fs");
const faker = require("faker");
console.log(__dirname);
var userdb = JSON.parse(fs.readFileSync(__dirname + "/users.json", "UTF-8"));

//Auth
exports.isAuthenticated = async function (email, password) {
  console.log("isAuthenticated called");
  let id = undefined;
  let name = "";
  let res = false;
  await userdb.users.findIndex((user) => {
    if (user.email === email && user.password === password) {
      id = user.id;
      name = user.fullname;
      res = true;
    }
  });
  return { data: id, name: name, email: email, status: res };
};

//New User
exports.postUser = async function (fullname, email, password) {
  console.log("postUser called");
  let exist = false;
  await userdb.users.findIndex((user) => {
    if (user.email === email) {
      exist = true;
    }
  });

  if (!exist) {
    const id = await faker.random.number();
    console.log("new id is", id);
    const newUser = {
      id: id,
      fullname: fullname,
      email: email,
      password: password,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await userdb.users.push(newUser);
    fs.writeFileSync(__dirname + "/users.json", JSON.stringify(userdb, null, 2), "utf8");
    return { data: id, name: fullname, email: email, status: true };
  } else {
    console.log("user exists");
    return { status: false };
  }
};

//Check User
exports.checkUserExist = async function (email) {
  console.log("checkUserExist called");
  let exist = false;
  await userdb.users.findIndex((user) => {
    if (user.email === email) {
      exist = true;
    }
  });

  if (!exist) {
    return { status: false };
  } else {
    return { status: true };
  }
};

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
