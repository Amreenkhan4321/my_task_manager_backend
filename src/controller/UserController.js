const { StatusCodes } = require("http-status-codes");
const User = require("../models/UserModel");
const {
  hashPassword,
  comparePassword,
  jwtTokenGenerator,
  createError,
  createResponse,
  checkRequiredFields,
} = require("../services/CommonService");
const Role = require("../models/RoleModel");
const ResponseMessage = require("../utils/common/ResponseMessage");

// user register api
exports.userRegister = async (req, res) => {
  try {
    let { name, email, password, mobile } = req.body;

    const requiredFields = await checkRequiredFields(req.body, [
      "name",
      "email",
      "password",
      "mobile",
    ]);

    if (!requiredFields.isValid) {
      return createResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "All fields are required",
        [requiredFields.errorMessage]
      );
    }

    const findUser = await User.findOne({ email });
    const isNumber = await User.findOne({ mobile });

    if (findUser) {
      return createResponse(
        res,
        StatusCodes.CONFLICT,
        "Email Already Exist",
        []
      );
    }
    if (isNumber) {
      return createResponse(
        res,
        StatusCodes.CONFLICT,
        "Mobile Already Exist",
        []
      );
    }
    password = await hashPassword(password);
    let newUser = new User({
      name,
      email,
      password,
      mobile,
    });
    await newUser.save();
    return createResponse(
      res,
      StatusCodes.CREATED,
      "User register successfully",
      newUser
    );
  } catch (error) {
    return createError(res, error);
  }
};

//user login
exports.userLogin = async (req, res) => {
  try {
    let { email, password } = req.body;
    const requiredFields = await checkRequiredFields(req.body, [
      "email",
      "password",
    ]);

    if (!requiredFields.isValid) {
      return createResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "All fields are required",
        [requiredFields.errorMessage]
      );
    }
    const findUser = await User.findOne({ email, isDeleted: false });
    if (!findUser) {
      return createResponse(res, StatusCodes.NOT_FOUND, "User not found", []);
    }
    let isPasswordValid = await comparePassword(password, findUser.password);
    if (!isPasswordValid) {
      return createResponse(
        res,
        StatusCodes.NOT_FOUND,
        "Invalid Credentials",
        []
      );
    } else {
      let payload = {
        user: { id: findUser._id },
      };

      const token = await jwtTokenGenerator(
        payload,
        process.env.JWT_SECRET_KEY
      );

      if (findUser.role) {
        const findRolePermisssion = await Role.findOne({
          _id: findUser.role,
          isDeleted: false,
        });

        return res.status(200).json({
          status: 200,
          message: `${findRolePermisssion.role_name} login successfully `,
          data: { findUser, token, findRolePermisssion },
        });
      } else {
        return createResponse(res, StatusCodes.OK, "Login successfully", {
          findUser,
          token,
        });
      }
    }
  } catch (error) {
    return createError(res, error);
  }
};

//forgot password
exports.forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;
    const findUser = await User.findOne({ email: email, isDeleted: false });
    if (!findUser) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        data: [],
      });
    } else {
      let payload = {
        user: { id: findUser._id },
      };
      //   console.log(payload, "payload");
      const token = await jwtTokenGenerator(
        payload,
        process.env.JWT_SECRET_KEY
      );
      return res.status(200).json({
        status: 200,
        message: "OTP send succefully",
        data: { token },
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: error,
    });
  }
};

//otp verify
exports.userVerifyOtp = async (req, res) => {
  try {
    let { otp } = req.body;

    if (req.user) {
      const findUser = await User.findOne({ _id: req.user.id });
      // console.log(findUser._id, "req.user");
      if (!findUser) {
        return res.status(404).json({
          status: 404,
          message: "User not found",
        });
      }
      //   console.log(findUser, "findUser");
      if (!req.body.otp) {
        return res.status(400).json({
          status: 400,
          message: "Bad request",
        });
      }
      let myOtp = 2023;
      if (otp == myOtp) {
        let payload = {
          user: { id: findUser._id },
        };
        const token = await jwtTokenGenerator(
          payload,
          process.env.JWT_SECRET_KEY
        );
        return res.status(200).json({
          status: 200,
          message: "OTP verify succefully",
          data: { token },
        });
      } else {
        return res.status(404).json({
          status: 404,
          message: "Invalid OTP",
          data: [],
        });
      }
    } else {
      return res.status(401).json({
        status: 401,
        message: "Token not authorized",
        data: [],
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: error,
    });
  }
};

//reset password

exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    console.log(req.user, "req.user");
    if (req.user) {
      const findUser = await User.findById(req.user.id);
      // console.log(findUser, "findUser");
      if (!findUser) {
        return res.status(404).json({
          status: 404,
          message: "User not found",
        });
      }
      if (!req.body.newPassword) {
        return res.status(400).json({
          status: 400,
          message: "Bad request",
        });
      }
      const updatedPassword = await hashPassword(newPassword);
      const updateUser = await User.findByIdAndUpdate(
        req.user.id,
        { $set: { password: updatedPassword } },
        { new: true }
      );
      return res.status(200).json({
        status: 200,
        message: "Password reset successfully",
        data: updateUser,
      });
    } else {
      return res.status(401).json({
        status: 401,
        message: "Token not authorized",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: error.message,
    });
  }
};

//add user with role
exports.addUser = async (req, res) => {
  try {
    if (req.user) {
      let { name, email, password, role, mobile } = req.body;
      const requiredFields = await checkRequiredFields(req.body, [
        "name",
        "email",
        "password",
        "mobile",
        "role",
      ]);

      if (!requiredFields.isValid) {
        return createResponse(
          res,
          StatusCodes.BAD_REQUEST,
          "All fields are required",
          [requiredFields.errorMessage]
        );
      }
      const findUser = await User.findOne({ email });
      const isNumber = await User.findOne({ mobile });

      if (findUser) {
        return createResponse(
          res,
          StatusCodes.CONFLICT,
          "Email Already Exist",
          []
        );
      }
      if (isNumber) {
        return createResponse(
          res,
          StatusCodes.CONFLICT,
          "Mobile Already Exist",
          []
        );
      }
      password = await hashPassword(password);
      let newUser = new User({
        name,
        email,
        password,
        mobile,
        role,
      });
      await newUser.save();
      return createResponse(
        res,
        StatusCodes.CREATED,
        "User added successfully",
        newUser
      );
    } else {
      return createResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        "User not Exist",
        []
      );
    }
  } catch (error) {
    return createError(res, error);
  }
};

//get user list
exports.getUserList = async (req, res) => {
  try {
    if (req.user) {
      const findUser = await User.find({ isDeleted: false }).populate({
        path: "role",
        select: "role_name",
      });
      return createResponse(
        res,
        StatusCodes.OK,
        ResponseMessage.DATA_GET_SUCCESSFULLY,
        findUser
      );
    } else {
      return createResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        ResponseMessage.USER_NOT_EXIST
      );
    }
  } catch (error) {
    return createError(res, error);
  }
};

//delete user list
exports.deleteUser = async (req, res) => {
  try {
    if (req.user) {
      let { id } = req.params;
      const findUser = await User.findOne({ isDeleted: false, _id: id });
      if (!findUser) {
        return createResponse(
          res,
          StatusCodes.NOT_FOUND,
          ResponseMessage.USER_NOT_FOUND
        );
      }
      if (findUser) {
        await User.findByIdAndUpdate(
          { _id: id },
          { $set: { isDeleted: true } },
          {
            new: true,
          }
        );
        return createResponse(res, StatusCodes.OK, ResponseMessage.USER_DELETE);
      }
    } else {
      return createResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        ResponseMessage.USER_NOT_EXIST
      );
    }
  } catch (error) {
    return createError(res, error);
  }
};

//update user
exports.updateUserList = async (req, res) => {
  try {
    if (req.user) {
      let { name, email, role, mobile, id } = req.body;
      const findUser = await User.findOne({ _id: id, isDeleted: false });
      if (!findUser) {
        return createResponse(
          res,
          StatusCodes.NOT_FOUND,
          ResponseMessage.USER_NOT_FOUND
        );
      }
      if (findUser) {
        await User.findByIdAndUpdate(
          { _id: id },
          { $set: { name, email, role, mobile } },
          {
            new: true,
          }
        );
        return createResponse(
          res,
          StatusCodes.OK,
          ResponseMessage.USER_UPDATED
        );
      }
    } else {
      return createResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        ResponseMessage.USER_NOT_EXIST
      );
    }
  } catch (error) {
    return createError(res, error);
  }
};
