const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userProjectSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  },
  { timestamps: true }
);

const UserProject = mongoose.model("UserProject", userProjectSchema);
module.exports = UserProject;
