const express = require("express");
const commonRoutes = express.Router();
const Role = require("../controller/RoleController");
const commonAuth = require("../middleware/CommonAuth");

commonRoutes.post("/addrole", commonAuth, Role.addRole);
commonRoutes.get("/getRoleList", commonAuth, Role.getRoleList);
commonRoutes.post("/getSingleRole/:id", commonAuth, Role.getSingleRole);
commonRoutes.post("/updateRole/:id", commonAuth, Role.updateRole);
commonRoutes.post("/deleteRole/:id", commonAuth, Role.deleteRole);

module.exports = commonRoutes;
