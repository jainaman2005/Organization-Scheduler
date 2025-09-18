const express = require('express');
const orgRouter = express.Router();
const {register, deleteOrg} = require("../controllers/organization.controller.js");
const {authToken} = require("../middleware/authMiddleware.js");
const IdValidate = require("../middleware/IdValidate.js");
const {orgRegisterValidation} = require("../validator/inputValidators.js")
const validate = require("../middleware/validate.js");

orgRouter.post('/register', orgRegisterValidation, validate, register);
orgRouter.delete('/:orgId', IdValidate, authToken, deleteOrg); 

module.exports = orgRouter;