const { body} = require("express-validator");
const mongoose = require("mongoose");

// Validate raising a query
const raiseQueryValidator = [
  body("title")
    .notEmpty()
    .withMessage("Query title is required")
    .isLength({ max: 100 })
    .withMessage("Title can be max 100 characters"),
  body("message")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description can be max 500 characters"),
];

// Validate adding a response
const addResponseValidator = [
  body("responseMessage")
    .notEmpty()
    .withMessage("Response message is required")
    .isLength({ max: 500 })
    .withMessage("Response message can be max 500 characters"),
];

// Validate editing a response
const editResponseValidator = [
  body("responseMessage")
    .notEmpty()
    .withMessage("Message cannot be empty")
    .isLength({ max: 500 })
    .withMessage("Message can be max 500 characters"),
];
const resolveQueryValidator = [
  body("resolved")
    .isBoolean()
    .withMessage("Resolved message must be a boolean")
];
module.exports = {
  raiseQueryValidator,
  addResponseValidator,
  editResponseValidator,
  resolveQueryValidator,
};

