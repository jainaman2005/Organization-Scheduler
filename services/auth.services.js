const User = require("../models/user.model");
const bcrypt = require('bcryptjs');

const authService = {
    login: async (email, password) => {
        const user = await User.findOne({ email: email });
        if (!user) {
            throw new Error("Invalid User");
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid Credentials');
        }
        return user.generateAuthToken();
    },

    register: async (name, email, password, role, organizationId) => {
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            throw new Error('Email Already in Use');
        }
        // Password hashing is now handled by the User model's pre-save hook
        const newUser = await User.create({
            name,
            email,
            password, // Pass raw password, model will hash it
            role,
            organizationId
        });
        return newUser;
    },

    // Placeholder for forgotPassword and resetPassword logic
    forgotPassword: async (email) => {
        // Implement logic to send a password reset link
        throw new Error("Forgot password not yet implemented.");
    },

    resetPassword: async (token, newPassword) => {
        // Implement logic to reset password using a token
        throw new Error("Reset password not yet implemented.");
    }
};

module.exports = authService;