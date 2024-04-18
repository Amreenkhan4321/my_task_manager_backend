const express = require("express");
const commonAuth = require("../middleware/CommonAuth");
const userRoutes = express.Router();
const User = require("../controller/UserController");
const Project = require("../controller/ProjectController");
const Task = require("../controller/TaskController");
userRoutes.post("/register", User.userRegister);
userRoutes.post("/login", User.userLogin);
//user crud
userRoutes.get("/getuserlist", commonAuth, User.getUserList);
userRoutes.post("/adduser", commonAuth, User.addUser);
userRoutes.post("/deleteuser/:id", commonAuth, User.deleteUser);
userRoutes.post("/updateuser", commonAuth, User.updateUserList);

//project crud
userRoutes.post("/create_project", commonAuth, Project.createProject);
userRoutes.get("/get_all_project", commonAuth, Project.getallProjects);
userRoutes.post("/delete_project/:id", commonAuth, Project.deleteProjects);
userRoutes.post("/update_project", commonAuth, Project.updateProjects);
//user add in project
userRoutes.post("/add_user_project", commonAuth, Project.addUserInProjects);
userRoutes.post(
  "/remove_employee_project",
  commonAuth,
  Project.removeUserFromProject
);
userRoutes.post(
  "/getAssignProjectList",
  commonAuth,
  Project.getProjectsListAssignee
);

//task
userRoutes.post("/create-task", commonAuth, Task.createTask);
userRoutes.post("/get-task-list", commonAuth, Task.getAllTaskList);
userRoutes.post("/update-task-status", commonAuth, Task.updateTaskStatus);
userRoutes.post(
  "/create-time-history",
  commonAuth,
  Task.createTaskTimerHistory
);

userRoutes.post("/get-tasklist-employee", commonAuth, Task.getUserTasklist);
userRoutes.get("/get-all-tasklist", commonAuth, Task.getAllTaskList);

module.exports = userRoutes;
