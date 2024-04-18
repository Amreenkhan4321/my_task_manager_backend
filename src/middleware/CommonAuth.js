const jwt = require("jsonwebtoken");
const { createError, createResponse } = require("../services/CommonService");
const { StatusCodes } = require("http-status-codes");

module.exports = function (req, res, next) {
  const token =
    req.headers.auth ||
    req.headers.Auth ||
    req.headers.Authorization ||
    req.headers.authorization;

  if (!token) {
    return createResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      "Token not authorized",
      []
    );
  } else {
    try {
      let decode = jwt.verify(token, process.env.JWT_SECRET_KEY);

      if (decode.user) {
        req.user = decode.user;
      }else{
        return createResponse(
          res,
          StatusCodes.UNAUTHORIZED,
          "User not exist",
          [])
      }
      next();
    } catch (error) {
      return createError(res, error);
    }
  }
};
