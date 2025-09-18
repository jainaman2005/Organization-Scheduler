const User = require("../models/user.model");
const bcrypt = require('bcryptjs');

const memberService = {
    getOwnProfile: async (userId) => {
        const user = await User.findById(userId).populate("organizationId", "name");
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    },

    updateOwnProfile: async (userId, updateFields) => {
        if (Object.keys(updateFields).length === 0) {
            throw new Error("No valid fields provided to update");
        }
        const updatedUser = await User.findOneAndUpdate({ _id: userId }, updateFields, { new: true });
        if (!updatedUser) {
            throw new Error("User not found");
        }
        return updatedUser;
    },

    updateOwnPassword: async (userId, oldPassword, newPassword) => {
        const userFound = await User.findById(userId);
        if (!userFound) {
            throw new Error('User not found');
        }

        const isMatch = await userFound.comparePassword(oldPassword); // Use model method
        if (!isMatch) {
            throw new Error('Old password is Incorrect');
        }

        userFound.password = newPassword; // Model's pre-save hook will hash this
        await userFound.save();
        return userFound;
    },
};

module.exports = memberService;