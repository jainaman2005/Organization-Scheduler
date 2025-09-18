const { body } = require("express-validator");
const mongoose  = require("mongoose");
const registerValidation = [
    body("name")
        .notEmpty().withMessage("Name is required")
        .isLength({ min: 2 }).withMessage("Name must be at least 2 characters long").trim(),

    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email address"),

    body("password")
        .notEmpty().withMessage("Password is required")
        .isString()
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters").trim(),

    body("role")
        .notEmpty().withMessage("Role is required")
        .isIn(["Manager", "Member"]).withMessage("Invalid role"),
    // organizationId is required for non-admins
    body("organizationId").optional().custom((value, { req }) => {
        if (req.body.role !== "Admin" && !value) {
            throw new Error("organizationId is required for non-admin users");
        }
        return true;
    }),

];

const loginValidation = [
    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email address"),

    body("password")
        .notEmpty().withMessage("Password is required")
];

const changePasswordValidation = [
    body("oldPassword")
        .notEmpty().withMessage("Old Password required"),
    body("newPassword")
        .notEmpty().withMessage("New Password is required")
        .isLength({ min: 6 }).withMessage("New Password must be at least 6 characters"),
]
const updateUserValidastion = [
    body("name")
        .optional()
        .isString().
        withMessage("Name must be a string")
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be 2-50 characters long")
        .trim(),
    body("email")
        .optional()
        .isEmail()
        .withMessage("Please provide a valid email"),
    body("role")
        .optional()
        .isIn(["Manager", "Member"]) //avoid admin
        .withMessage("Invalid role"),
    body('avatarUrl')
        .optional()
        .isURL()
        .withMessage("Avatar URL must be a valid URL"),
    body("supervisorId")
    .optional()
    .custom(async(value,{req}) => {
        // check if supervisor exists in DB and its id is valid:
        if(!mongoose.Types.ObjectId.isValid(id)){
            throw new Error("Supervisor Id is invalid");
        }
        const supervisor = await User.findById(value);
        if (!supervisor) {
            throw new Error("Supervisor not found");
        }
        // check role condition (for example: must be a Manager or Admin)
        if (!["Manager", "Admin"].includes(supervisor.role)) {
            throw new Error("Supervisor must be a Manager or Admin");
        }

        // you can also check same organization
        if (supervisor.organizationId._id.toString() !== req.user.organizationId.toString()) {
            throw new Error("Supervisor must belong to the same organization");
        }
        return true;
    }
    )
]
const orgRegisterValidation = [
    body("orgName")
        .notEmpty().withMessage("Org Name is required")
        .isLength({ min: 2 }).withMessage("Org Name must be at least 2 characters long").trim(),
    body("adminName")
        .notEmpty().withMessage("Org Name is required")
        .isLength({ min: 2 }).withMessage("Org Name must be at least 2 characters long").trim(),
    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email address"),
    body("password")
        .notEmpty().withMessage("Password is required")
        .isString()
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters").trim(),
]
module.exports = { registerValidation, loginValidation, changePasswordValidation, updateUserValidastion,orgRegisterValidation };
