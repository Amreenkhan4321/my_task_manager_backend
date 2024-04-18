const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      require: false,
    },
    clientName: {
      type: String,
      require: false,
    },
    projectManager: {
      type: String,
      require: false,
    },
    technicalProjectManager: {
      type: String,
      require: false,
    },
    salesManager: {
      type: String,
      require: false,
    },
    requirements: {
      type: String,
      require: false,
    },

    startDate: {
      type: String,
      require: false,
    },

    dueDate: {
      type: String,
      require: false,
    },
    assignDate: {
      type: String,
      require: false,
    },
    projectDescription: {
      type: String,
      require: false,
    },
    isActive: {
      type: Boolean,
      require: false,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      require: false,
      default: false,
    },
    status: {
      type: String,
      enum: ["Open", "InProgress", "Complete", "Pending"],
      default: "Open",
    },

    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);
module.exports = Project;
