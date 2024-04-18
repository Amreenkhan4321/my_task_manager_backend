const bcrypt = require("bcrypt");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const ResponseMessage = require("../utils/common/ResponseMessage");

// hash password
exports.hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw error;
  }
};

//jwt token genrator
exports.jwtTokenGenerator = async (payload, secretKey) => {
  try {
    const token = jwt.sign(payload, secretKey || "", {
      expiresIn: "24h",
    });
    return token;
  } catch (error) {
    throw error;
  }
};

//compare password
exports.comparePassword = async (password, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw error;
  }
};

//error response
exports.createError = (res, error) => {
  return res.status(500).json({
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    message: ResponseMessage.INTERNAL_SERVER_ERROR,
    data: error ? error.message : [],
  });
};

//create response
exports.createResponse = (res, status, message, data) => {
  return res.status(status).json({
    status,
    message,
    data: data ? data : [],
  });
};

//#region required fields
exports.checkRequiredFields = (object, requiredFields) => {
  let isValid = true;
  const missingFields = [];

  requiredFields.forEach((field) => {
    if (
      !(field in object) ||
      object[field] === undefined ||
      object[field] === null ||
      String(object[field]).trim() === ""
    ) {
      missingFields.push(field);
      isValid = false;
    }
  });

  if (missingFields.length > 0) {
    const errorMessage = `Missing required fields: ${missingFields.join(", ")}`;
    return { errorMessage, isValid };
  }

  return { isValid };
};
