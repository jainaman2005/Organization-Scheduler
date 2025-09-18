const express  = require("express");
const taskRouter = express.Router();
const taskController = require("../controllers/task.controller.js");
const taskInputValidation = require("../validator/taskInputValidators.js");
const validate = require("../middleware/validate.js")
const IdValidate = require("../middleware/IdValidate.js");
const queryRouter = require("./query.routes.js") // Import queryRouter
const {authUser, roleMiddleware} = require("../middleware/authMiddleware.js")

// taskRouter.use(authToken,authUser); // Commented out as per your original file
taskRouter.use(authUser); // All task routes require an authenticated user

// Create task (Manager/Admin)
taskRouter.post(
  "/",
  roleMiddleware(["Manager","Admin"]),
  taskInputValidation.createTask,
  validate,
  taskController.createTask
);

// Get tasks created/assigned by Manager/Admin
taskRouter.get(
  "/managed",
  roleMiddleware(["Manager","Admin"]),
  taskController.getManagedTasks // Corrected to match controller method name
);

// Get my tasks (Manager: assigned by admin, Member: assigned by manager)
taskRouter.get(
  "/my",
  taskController.getTasksAssignedToMe // Corrected to match controller method name
);

// Get one of my tasks by ID
taskRouter.get(
  "/:taskId",
  IdValidate,
  taskController.getTaskById
);

// Update task (Admin/Manager only, except status)
taskRouter.put(
  "/my/:taskId",
  IdValidate,
  taskInputValidation.updateTask,
  validate,
  taskController.updateTask
);

// Update only status (any assigned user)
taskRouter.patch(
  "/:taskId/status",
  IdValidate,
  taskInputValidation.updateStatus,
  validate,
  taskController.updateTaskStatus // Corrected to match controller method name
);

// Delete task (only creator, or Admin override)
taskRouter.delete(
  "/:taskId",
  IdValidate,
  taskController.deleteTask
);

// for queries: Nesting the query routes under tasks
// All query routes will now be prefixed with /tasks/:taskId/queries
taskRouter.use("/:taskId/queries", queryRouter);

module.exports = taskRouter;