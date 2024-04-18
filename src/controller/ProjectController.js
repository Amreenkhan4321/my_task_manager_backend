const Project = require("../models/ProjectModel");
const User = require("../models/UserModel");

//create project
exports.createProject = async (req, res) => {
  try {
    if (req.user) {
      let {
        projectName,
        clientName,
        projectManager,
        technicalProjectManager,
        salesManager,
        requirements,
        startDate,
        projectDescription,
        status,
        dueDate,
        assignDate,
      } = req.body;

      const existingProject = await Project.findOne({
        projectName,
      });

      if (existingProject) {
        return res.status(409).json({
          status: 409,
          message: "Project already exists",
          data: [],
        });
      }

      let projectData = new Project({
        projectName,
        clientName,
        projectManager,
        technicalProjectManager,
        salesManager,
        requirements,
        startDate,
        projectDescription,
        status,
        dueDate,
        assignDate,
      });

      await projectData.save();

      res.status(201).json({
        status: 201,
        message: "Project added successfully",
        data: projectData,
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

//get all project
exports.getallProjects = async (req, res) => {
  try {
    if (req.user) {
      const findData = await Project.find({ isDeleted: false }).populate({
        path: "users",
        select: ["name"],
      });
      if (findData) {
        return res.status(200).json({
          status: 200,
          message: "Project get successfully",
          data: findData,
        });
      }
    } else {
      return res.status(401).json({
        status: 401,
        message: "You are not authorized",
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

//delete project
exports.deleteProjects = async (req, res) => {
  try {
    if (req.user) {
      const { id } = req.params;
      const findProject = await Project.findOne({ isDeleted: false, _id: id });
      console.log(findProject, "findProject");
      console.log(id, "id");
      //Check for
      if (!findProject) {
        return res.status(400).json({
          status: 400,
          message: "Project not found",
        });
      }
      if (findProject) {
        await Project.findByIdAndUpdate(
          { _id: id },
          { $set: { isDeleted: true } },
          { new: true }
        );
        res.status(200).json({
          status: 200,
          message: "Project deleted successfully",
          data: [],
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: error,
    });
  }
};

//update projects
exports.updateProjects = async (req, res) => {
  try {
    if (req.user) {
      let {
        projectName,
        clientName,
        projectManager,
        technicalProjectManager,
        salesManager,
        requirements,
        startDate,
        projectDescription,
        status,
        dueDate,
        assignDate,
        id,
      } = req.body;
      const project = await Project.findOne({ isDeleted: false, _id: id });
      if (!project) {
        return res.status(404).json({
          status: 404,
          message: "Project not found",
        });
      }
      if (project) {
        const updatedData = await Project.findByIdAndUpdate(
          { _id: id },
          {
            $set: {
              projectName,
              clientName,
              projectManager,
              technicalProjectManager,
              salesManager,
              requirements,
              startDate,
              projectDescription,
              status,
              dueDate,
              assignDate,
            },
          },
          { new: true }
        );
        // console.log(updatedData);
        if (updatedData) {
          res.status(200).json({
            status: 200,
            message: "Project updated successfully",
            data: updatedData,
          });
        } else {
          res.status(400).json({
            status: 400,
            message: "Failed to Update",
          });
        }
      }
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: error.message,
    });
  }
};

//add user in projects
exports.addUserInProjects = async (req, res) => {
  try {
    if (req.user) {
      let { projectId, usersId } = req.body;

      // Find the project by projectId
      const project = await Project.findOne({
        isDeleted: false,
        _id: projectId,
      });
      if (!project) {
        return res.status(404).json({
          status: 404,
          message: "Project not found",
          data: [],
        });
      }

      // Check if userid is provided
      if (!usersId || usersId.length === 0) {
        return res.status(400).json({
          status: 400,
          message: "No users provided",
          data: [],
        });
      }

      // Array to store detailed error messages
      const errorMessages = [];

      // Create an array of promises for adding employees
      const addUserPromises = usersId.map(async (userId) => {
        try {
          // Find the employee by employeeId
          const user = await User.findOne({
            isDeleted: false,
            _id: userId,
          });

          if (!user) {
            throw new Error(`User with ID ${userId} not found`);
          } else if (!project.users.includes(user._id)) {
            // Add the employee to the project
            project.users.push(user._id);
          } else {
            throw new Error(
              `User with ID ${usersId} already exists in the project`
            );
          }
        } catch (error) {
          // Collect detailed error messages
          errorMessages.push(error.message);
        }
      });

      // Wait for all promises to resolve
      await Promise.all(addUserPromises);

      // Save the changes to the project
      await project.save();

      // Check if any errors occurred and respond accordingly
      if (errorMessages.length > 0) {
        return res.status(409).json({
          status: 409,
          message: "Users already exist in the project",
          errors: errorMessages,
          data: project,
        });
      } else {
        return res.status(200).json({
          status: 200,
          message: "Users added to the project successfully",
          data: project,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: error.message,
    });
  }
};

// API endpoint to remove an employee from a project
exports.removeUserFromProject = async (req, res) => {
  try {
    if (req.user) {
      const { projectId, userId } = req.body;

      // Find the project by projectId
      const project = await Project.findOne({
        isDeleted: false,
        _id: projectId,
      });

      if (!project) {
        return res.status(404).json({
          status: 404,
          message: "Project not found",
          data: [],
        });
      }

      const userIndex = project.users.indexOf(userId);
      if (userIndex === -1) {
        return res.status(404).json({
          status: 404,
          message: "User not found in the project",
          data: [],
        });
      }

      // Remove the employee from the project
      project.users.splice(userIndex, 1);

      // Save the changes to the project
      await project.save();

      return res.status(200).json({
        status: 200,
        message: "User removed from the project successfully",
        data: [],
      });
    } else {
      return res.status(401).json({
        status: 401,
        message: "You are not authorized",
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

//get all project for assignee employees
exports.getProjectsListAssignee = async (req, res) => {
  try {
    if (req.user) {
      let { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          status: 400,
          message: "User ID is required",
          data: [],
        });
      }
      const projects = await Project.find({ users: userId }).populate({
        path: "users",
        select: ["_id", "name", "email"],
      });

      if (projects.length === 0) {
        return res.status(404).json({
          status: 404,
          message: "No projects found for the specified user ID",
          data: [],
        });
      }

      if (projects) {
        return res.status(200).json({
          status: 200,
          message: "Project get successfully",
          data: projects,
        });
      }
    } else {
      return res.status(401).json({
        status: 401,
        message: "You are not authorized",
      });
    }
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        status: 400,
        message: "Invalid employee ID format",
        data: [],
      });
    }
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: error,
    });
  }
};
