const moment = require("moment");
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: false,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: false,
    },
    taskDuration: {
      type: String,
      require: false,
    },
    taskCode: {
      type: String,
      require: false,
    },
    assignDate: {
      type: String,
      require: false,
    },
    dueDate: {
      type: String,
      require: false,
    },
    title: {
      type: String,
      require: false,
    },
    description: {
      type: String,
      require: false,
    },
    totalTaskDuration: {
      type: String,
      require: false,
    },

    status: {
      type: String,
      require: false,
      enum: [
        "Open",
        "InProgress",
        "Development Done",
        "On Hold",
        "Rejected",
        "Close",
      ],
      default: "Open",
    },
    taskTimerHistory: [
      {
        date: { type: String, default: moment().format("YYYY-MM-DD") },
        startTime: {
          type: String,
        },
        endTime: { type: String },
        duration: { type: Number },
        taskTime: { type: String },
      },
      { timestamps: true },
    ],
    projectId: [{ type: mongoose.Schema.ObjectId, ref: "Project" }],
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
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
