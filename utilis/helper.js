const express = require("express");
var jwt = require("jsonwebtoken");
var config = require("../config/config");
const _ = require("lodash");
var uuid = require("uuid");
const moment = require("moment-timezone");
const fs = require("fs");
const faker = require("faker");
console.log(__dirname);
var usertb = JSON.parse(fs.readFileSync(__dirname + "/users.json", "UTF-8"));
var verificaitontb = JSON.parse(fs.readFileSync(__dirname + "/verifications.json", "UTF-8"));

//Auth
exports.isAuthenticated = async function (email, password) {
  console.log("isAuthenticated called");
  let id = undefined;
  let userObj;
  let res = false;
  await usertb.users.findIndex((user) => {
    if (user.email === email && user.password === password) {
      id = user.id;
      res = true;
      userObj = user;
    }
  });
  console.log("userObj", userObj);
  return { data: userObj, status: res };
};

//New User
exports.postUser = async function (fullname, email, password) {
  console.log("postUser called");
  let exist = false;
  await usertb.users.findIndex((user) => {
    if (user.email === email) {
      exist = true;
    }
  });

  if (!exist) {
    const id = await faker.random.number();
    const newUser = {
      id: id,
      fullname: fullname,
      email: email,
      password: password,
      status: "Pending_verificaiton",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await usertb.users.push(newUser);
    fs.writeFileSync(__dirname + "/users.json", JSON.stringify(usertb, null, 2), "utf8");
    return { data: id, name: fullname, email: email, status: true };
  } else {
    console.log("user exists");
    return { status: false };
  }
};

//Add Verificaiton code
exports.addVerificationCode = async function (id, email, code) {
  console.log("addVerificationCode called");
  let exist = false;
  await verificaitontb.codes.findIndex((verification) => {
    if (verification.email === email) {
      exist = true;
    }
  });

  if (!exist) {
    const newVerification = {
      id: id,
      email: email,
      code: code,
    };
    await verificaitontb.codes.push(newVerification);
    fs.writeFileSync(__dirname + "/verifications.json", JSON.stringify(verificaitontb, null, 2), "utf8");
    return { status: true };
  } else {
    console.log("verification already exists");
    return { status: false };
  }
};

//Verify Verification code
exports.verify = async function (req, verificationCode) {
  console.log(req.userId);
  console.log(req.email);
  let verified = false;
  let data;
  await verificaitontb.codes.findIndex((verification) => {
    if (verification.id === req.userId) {
      console.log("user matched", verification.code);
      console.log("verificationCode is", verificationCode);
      if (verification.code == verificationCode) {
        verified = true;
      }
    }
  });

  if (verified) {
    //Update user status to Active
    await usertb.users.findIndex((user) => {
      if (user.email === req.email && user.id === req.userId) {
        console.log("user matched now -update it");
        user.status = "Pending_verificaiton" ? "Active" : "Active";
        data = user;
        status = true;
      }
    });
    fs.writeFileSync(__dirname + "/users.json", JSON.stringify(usertb, null, 2), "utf8");

    return { data: data, status: true };
  } else {
    return { status: false };
  }
};

//Check User
exports.checkUserExist = async function (email) {
  console.log("checkUserExist called");
  let exist = false;
  await usertb.users.findIndex((user) => {
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

//Resend verification code
exports.resend = async function (req, verificationCode) {
  let verified = false;
  //Update user status to Active
  await verificaitontb.codes.findIndex((verification) => {
    if (verification.email === req.email && verification.id === req.userId) {
      console.log("user matched now -update verification code");
      verification.code = verificationCode;
      verified = true;
    }
  });
  fs.writeFileSync(__dirname + "/verifications.json", JSON.stringify(verificaitontb, null, 2), "utf8");

  if (verified) {
    return { status: true };
  } else {
    return { status: false };
  }
};

//validateToken
exports.tokenVerify = function (req, res, next) {
  jwt.verify(req.headers["x-access-token"], process.env.API_KEY, function (err, authData) {
    req.userId = err ? null : authData.id;
    req.email = err ? null : authData.email;
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

exports.createTokens = function (userId, email, secret, secret2) {
  // return createTokens(user, secret,secret2);
  const createToken = jwt.sign({ id: userId, email: email }, secret, { expiresIn: config.jwtExpiryTime });

  const createRefreshToken = jwt.sign({ id: userId, email: email }, secret2, { expiresIn: config.refreshExpiryTime });

  var newToken = {
    token: createToken,
    refreshToken: createRefreshToken,
  };

  return newToken;
};

async function createTokens(userId, email, secret, secret2) {
  const createToken = jwt.sign({ id: userId, email: email }, secret, { expiresIn: config.jwtExpiryTime });

  const createRefreshToken = jwt.sign({ id: userId, email: email }, secret2, { expiresIn: config.refreshExpiryTime });
  var newToken = {
    token: createToken,
    refreshToken: createRefreshToken,
  };
  return newToken;
}
