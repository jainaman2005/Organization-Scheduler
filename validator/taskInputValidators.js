const { body } = require("express-validator");
const mongoose = require("mongoose");

const taskInputValidation = {
    createTask: [
        body("title")
            .notEmpty().withMessage("Title is required")
            .isLength({ min: 3 }).withMessage("Title must be at least 3 characters"),

        body("description")
            .optional()
            .isLength({ min: 5 }).withMessage("Description must be at least 5 characters"),

        body("assignedTo")
            .notEmpty().withMessage("AssignedTo is required")
            .custom((value) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    throw new Error("Invalid assignedTo ID");
                }
                return true;
            }),
        body("timeline")
            .optional()
            .isISO8601().withMessage("Timeline must be a valid date"),
    ],

    updateTask: [
        body("title")
            .optional()
            .isLength({ min: 3 }).withMessage("Title must be at least 3 characters"),

        body("description")
            .optional()
            .isLength({ min: 5 }).withMessage("Description must be at least 5 characters"),

        body("timeline")
            .optional()
            .isISO8601().withMessage("Timeline must be a valid date"),
        body("assignTo")
            .optional()
            .custom((value )=>{
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    throw new Error("Invalid assignedTo ID");
                }
                return true;
            }),
    ],

    updateStatus: [
        body("status")
            .notEmpty().withMessage("Status is required")
            .isIn(['Not Started', 'Ongoing', 'Partially Completed', 'Completed'])
            .withMessage("Invalid status value"),
    ]
};

module.exports = taskInputValidation;
