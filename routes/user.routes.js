const express = require("express");
const userRouter = express.Router();
const {authUser, authManager, authAdmin, authToken} = require("../middleware/authMiddleware.js"); 
const validate = require("../middleware/validate.js");
const {changePasswordValidation, registerValidation, updateUserValidastion} = require('../validator/inputValidators.js');
const IdValidate = require("../middleware/IdValidate.js");
const memberControllers = require("../controllers/member.controller.js");
const managerControllers = require("../controllers/manager.controller.js");
const adminControllers = require("../controllers/admin.controller.js");
const taskRouter = require("./task.routes.js"); // Import taskRouter

userRouter.use(authToken); // Apply cookie-parser and auth token middleware to all user routes

// Members (can self-service):
userRouter.get("/me", authUser, memberControllers.getOwnProfile);
userRouter.put("/me", authUser, updateUserValidastion, validate, memberControllers.updateOwnProfile);
userRouter.put("/me/password", authUser, changePasswordValidation, validate, memberControllers.updateOwnPassword);

// 🟠 Managers (can CRUD members)
userRouter.get("/members", authManager, managerControllers.getMembers); // list all members under same org
userRouter.post("/members", authManager, managerControllers.createMember); // create new member
userRouter.put("/members/:userId", authManager, IdValidate, updateUserValidastion, validate, managerControllers.updateMember); // update member info
userRouter.delete("/members/:userId", authManager, IdValidate, managerControllers.removeMember); //remove Member:

// 🔴 Admin (can manage all users in org)
userRouter.get("/all-users", authAdmin, adminControllers.getAllUsersInOrg);
userRouter.put("/:userId", authAdmin, IdValidate, updateUserValidastion, validate, adminControllers.updateAnyUser); 
userRouter.delete("/:userId", authAdmin, IdValidate, adminControllers.deleteAnyUser);
userRouter.post("/add", authAdmin, registerValidation, validate, adminControllers.createUser);

// for task routing: Nesting the task router
// All task routes will now be prefixed with /users/tasks
userRouter.use("/tasks", taskRouter);

module.exports = userRouter;