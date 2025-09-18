const express = require('express');
const authRouter = express.Router();
const {login, logout} = require("../controllers/auth.controller.js");
const {loginValidation} = require("../validator/inputValidators.js");
const validate = require("../middleware/validate.js");

authRouter.post("/login", loginValidation, validate, login);
authRouter.post('/logout', logout);
/*{
----Advance Functionality----
// authRouter.post("/forgot-password", forgotPassword);
// authRouter.post("/reset-password", resetPassword);
}*/

module.exports = authRouter;