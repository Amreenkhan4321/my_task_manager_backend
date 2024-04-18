const { StatusCodes } = require("http-status-codes");
const Role = require("../models/RoleModel");
const {
  createError,
  createResponse,
  checkRequiredFields,
} = require("../services/CommonService");

//add role
exports.addRole = async (req, res) => {
  try {
    if (req.user) {
      let { role_name, role_permission } = req.body;

      // Validate input
      if (!role_name) {
        return res.status(400).json({
          status: 400,
          message: "Role name are required",
          data: [],
        });
      }

      // Check if the role already exists
      const existingRole = await Role.findOne({
        role_name,
        isDeleted: false,
      });
      if (existingRole) {
        return res.status(409).json({
          status: 409,
          message: "Role already exists",
          data: [],
        });
      }

      // Create a new role
      const newRole = new Role({
        role_name,
        role_permission,
      });

      // Save the role to the database
      await newRole.save();

      res.status(201).json({
        status: 201,
        message: "Role added successfully",
        data: newRole,
      });
    } else {
      return res.status(401).json({
        status: 401,
        message: "You are not authorized",
        data: [],
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: error,
    });
  }
};

//get role list
exports.getRoleList = async (req, res) => {
  try {
    if (req.user) {
      const findData = await Role.find({ isDeleted: false });
      if (!findData) {
        return res.status(200).json({
          status: 200,
          message: "No data found",
          data: [],
        });
      }
      if (findData) {
        return res.status(200).json({
          status: 200,
          message: "Role list get successfully",
          data: findData,
        });
      }
    } else {
      return res.status(401).json({
        status: 401,
        message: "You are not authorized",
        data: [],
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: error,
    });
  }
};

//get single role
exports.getSingleRole = async (req, res) => {
  try {
    if (req.user) {
      const { id } = req.params;
      const findRole = await Role.findOne({ _id: id, isDeleted: false });

      if (!findRole) {
        return res.status(400).json({
          status: 400,
          message: "Bad request",
        });
      }
      if (findRole) {
        return res.status(200).json({
          status: 200,
          message: "Single role get successfully",
          data: findRole,
        });
      }
    } else {
      return res.status(401).json({
        status: 401,
        message: "You are not authorized",
        data: [],
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: error,
    });
  }
};

//update role
exports.updateRole = async (req, res) => {
  try {
    if (req.user) {
      const { role_name, role_permission } = req.body;
      const { id } = req.params;

      const findData = await Role.findOne({
        _id: id,
        isDeleted: false,
      });
      // console.log(findData, "fdfd");
      if (!findData) {
        return res.status(404).json({
          status: 404,
          message: "Data not found",
        });
      }

      const roleExist = await Role.findOne({
        _id: { $ne: id },
        role_name,
        isDeleted: false,
      });
      if (roleExist) {
        return res.status(409).json({
          status: 409,
          message: "Role already exists",
        });
      }

      const updatedData = await Role.findByIdAndUpdate(
        { _id: id },
        { $set: { role_name, role_permission } },
        { new: true }
      );

      if (updatedData) {
        res.status(200).json({
          status: 200,
          message: "Role updated successfully",
          data: updatedData,
        });
      }
    } else {
      return res.status(401).json({
        status: 401,
        message: "You are not authorized",
        data: [],
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: error,
    });
  }
};

//delete role
exports.deleteRole = async (req, res) => {
  try {
    if (req.user) {
      const { id } = req.params;
      const findData = await Role.findOne({ isDeleted: false, _id: id });
      //Check for
      if (!findData) {
        return res.status(404).json({
          status: 404,
          message: "Data not found",
        });
      }
      if (findData) {
        await Role.findByIdAndUpdate(
          { _id: id },
          { $set: { isDeleted: true } },
          { new: true }
        );
        res.status(200).json({
          status: 200,
          message: "Role deleted successfully",
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
      data: error.message,
    });
  }
};
