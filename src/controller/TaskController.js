const Project = require("../models/ProjectModel");
const Task = require("../models/TaskModel")

//create task api
exports.createTask = async (req, res) => {
    try {
      if (req.user) {
        let {
          title,
          description,
          assignee,
          taskDuration,
          assignDate,
          dueDate,
          status,
          projectId,
        } = req.body;
        //Check if any required field is missing
  
        if (!title || !description || !taskDuration || !assignDate || !dueDate) {
          // Handle the case where one or more required fields are missing
          res.status(400).json({ error: "All fields are required" });
        } else {
          const findTaskCount = await Task.find({}).countDocuments();
          const taskCode = `TASK#${1 + findTaskCount}`;
          taskDuration = taskDuration + "Hr";
          const assignedBy = req.user.id;
          let newTask = new Task({
            title,
            description,
            assignee,
            assignedBy,
            taskDuration,
            assignDate,
            dueDate,
            status,
            projectId,
            taskCode,
          });
          await newTask.save();
          // console.log(newTask);
  
          return res.status(201).json({
            status: 201,
            message: "Task created successfully",
            data: newTask,
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
  
  //get task list of particular projects
  
  exports.getTaskList = async (req, res) => {
    try {
      if (req.user) {
        const id = req.body.id;
        //   console.log(id);
        const findData = await Task.find({
          projectId: id,
          isDeleted: false,
        });
  
        console.log(findData);
  
        if (findData.length === 0) {
          return res.status(200).json({
            status: 200,
            message: "No data found",
            data: [],
          });
        } else {
          return res.status(200).json({
            status: 200,
            message: "Tasks list get successfully",
            data: findData,
          });
        }
      }
    } catch (error) {
      // console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Internal server error",
        data: error,
      });
    }
  };
  
  //update task status
  exports.updateTaskStatus = async (req, res) => {
    try {
      if (req.user) {
        let { status, id } = req.body;
        const findData = await Task.findById({ _id: id, isDeleted: false });
        if (!findData) {
          return res.status(404).json({
            status: 404,
            message: "Task not found",
          });
        }
        if (findData) {
          // res.send("right");
          const updatedData = await Task.findByIdAndUpdate(
            { _id: id },
            { $set: { status } },
            { new: true }
          );
          if (updatedData) {
            res.status(200).json({
              status: 200,
              message: "Status updated successfully",
              data: updatedData,
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
  
  //create timer history
  
  exports.createTaskTimerHistory = async (req, res) => {
    try {
      if (req.user) {
        let { taskId, timerType, timerId } = req.body;
        if (!taskId || !timerType) {
          return res.status(400).json({
            status: 400,
            message: "All fields are required",
            data: [],
          });
        } else {
          const findTask = await Task.findOne({ _id: taskId, isDeleted: false });
          if (!findTask) {
            return res.status(404).json({
              status: 404,
              message: "Task not found",
              data: [],
            });
          }
          // res.send("success");
          if (timerType == 1) {
            // res.send("1");
            let startTime = moment().format("YYYY-MM-DDTHH:mm:ss");
            const updatedTaskStatus = await Task.findOneAndUpdate(
              { _id: taskId },
              {
                $push: {
                  taskTimerHistory: {
                    $each: [{ startTime: startTime }],
                    $position: 0,
                  },
                },
              },
              { new: true }
            );
            return res.status(200).json({
              status: 200,
              message: "Task status updated",
              data: [],
            });
          }
          if (timerType == 0) {
            let endTime = moment().format("YYYY-MM-DDTHH:mm:ss");
            //calculate totle duration in meliseconds
  
            //calculate totle duration in meliseconds
            function calculateTime(startTime, endTime) {
              const start = new Date(startTime);
              const end = new Date(endTime);
              const totalMileSeconds = end - start;
              return totalMileSeconds;
            }
  
            const totalMileSeconds = await calculateTime(
              findTask.taskTimerHistory[0].startTime,
              endTime
            );
  
            function timeFormater(totalDuration) {
              const seconds = Math.floor(totalDuration / 1000);
              const minutes = Math.floor(seconds / 60);
              const hours = Math.floor(minutes / 60);
              // Calculate remaining minutes and seconds
              const remainingMinutes = minutes % 60;
              const remainingSeconds = seconds % 60;
  
              const formattedTotalDuration = `${hours} hours : ${remainingMinutes} minutes : ${remainingSeconds} seconds`;
              return formattedTotalDuration;
            }
  
            const taskTimeLog = await timeFormater(totalMileSeconds);
  
            const updatedTaskEndTime = await Task.findOneAndUpdate(
              {
                _id: taskId,
                "taskTimerHistory._id": timerId,
              },
              {
                $set: {
                  "taskTimerHistory.$.endTime": endTime,
                  "taskTimerHistory.$.duration": totalMileSeconds,
                  "taskTimerHistory.$.taskTime": taskTimeLog,
                },
              },
              { new: true }
            );
  
            const totalDuration = updatedTaskEndTime.taskTimerHistory.reduce(
              (acc, curr) => {
                return acc + (curr.duration ? curr.duration : 0);
              },
              0
            );
  
            const totalTaskDuration = await timeFormater(totalDuration);
  
            const updatedTaskStatusWithDuration = await Task.findOneAndUpdate(
              {
                _id: taskId,
              },
              {
                $set: {
                  taskDuration: totalTaskDuration,
                },
              },
              { new: true }
            );
  
            return res.status(200).json({
              status: 200,
              message: "Task status updated",
              data: [],
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
  
  //get task list for particular user
  
  exports.getUserTasklist = async (req, res) => {
    try {
      if (req.user) {
        const { userId, month, year } = req.body;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  
        const findData = await Task.find({
          assignee: userId,
          isDeleted: false,
          assignDate: {
            $gte: startDate.toISOString().split("T")[0], // Convert to "YYYY-MM-DD" string
            $lte: endDate.toISOString().split("T")[0],
          },
        }).select(
          "assignee _id taskDuration assignDate title description assignedBy taskCode dueDate description taskTimerHistory projectId createdAt updatedAt isDeleted isActive"
        );
  
        const projectIds = [...new Set(findData.map((task) => task.projectId))];
  
        // Fetch project details based on projectIds
        const projects = await Project.find(
          { _id: { $in: projectIds } },
          "projectName _id"
        );
  
        // Create a map for quick lookup
        const projectMap = new Map(
          projects.map((project) => [project._id.toString(), project])
        );
  
        // Populate project name in each task
        const tasksWithProjectNames = findData.map((task) => {
          const projectName = projectMap.get(
            task.projectId.toString()
          ).projectName;
          return { ...task._doc, projectName }; // Using _doc to get a plain JavaScript object
        });
  
        return res.status(200).json({
          status: 200,
          message: "Task list get successfully",
          data: tasksWithProjectNames,
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
  
  //get all task list
  
  exports.getAllTaskList = async (req, res) => {
    try {
      if (req.user) {
        const findData = await Task.find({ isDeleted: false });
        if (findData.length === 0) {
          return res.status(200).json({
            status: 200,
            message: "No data available",
            data: findData,
          });
        }
        return res.status(200).json({
          status: 200,
          message: "get all task list successfully",
          data: findData,
        });
      }
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Internal server error",
        data: [],
      });
    }
  };
  