const express = require("express");
const queryRouter = express.Router();
const queryController = require("../controllers/query.controller.js");
const IdValidate = require("../middleware/IdValidate.js");
const queryServices = require("../services/query.services.js");
const { 
  raiseQueryValidator, 
  addResponseValidator, 
  editResponseValidator,
  resolveQueryValidator
} = require("../validator/queryValidator.js");
const validateInput = require("../middleware/validate.js"); // Corrected typo from "middlewre"

const {authToken, authUser} = require("../middleware/authMiddleware.js");


// queryRouter.use(authToken, authUser); // Commented out as per your original file

// 1. Raise a new query (member/manager)
queryRouter.post(
  "/",
  raiseQueryValidator,
  validateInput,
  // Note: Using service directly as middleware is an unconventional pattern.
  // Typically, the controller calls the service. Ensure 'queryServices.raiseQuery'
  // calls next() if it doesn't send a response itself.
  queryController.raiseQuery
);

// 2. Get all queries for a specific task
// Assumes taskId comes from req.params if nested, or req.query if standalone.
queryRouter.get(
  "/",
  queryController.getQueriesByTask
);

// 3. Add a response to a query
queryRouter.post(
  "/:queryId/responses",
  IdValidate,
  addResponseValidator,
  validateInput,
  queryController.addResponse
);

// 4. Get all responses for a query
queryRouter.get(
  "/:queryId/responses",
  IdValidate,
  queryController.getResponses
);

// 5. Delete Response for a query
queryRouter.delete(
  "/:queryId/responses/:responseId",
  IdValidate,
  queryController.deleteResponse
);

// 6. Update Response for a query
queryRouter.patch(
  "/:queryId/responses/:responseId",
  IdValidate,
  editResponseValidator,
  validateInput,
  queryController.editResponse
);

// 7. Mark a query as resolved (raiser only)
queryRouter.patch(
  "/:queryId/resolve",
  IdValidate,
  resolveQueryValidator,
  validateInput,
  queryController.resolveQuery
);

// 8. Delete a query
queryRouter.delete(
  "/:queryId",
  IdValidate,
  queryController.deleteQuery
);

module.exports = queryRouter;