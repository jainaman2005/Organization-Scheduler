const User = require("../models/user.model");
const bcrypt = require('bcryptjs');

const managerService = {
    getMembersUnderSupervision: async (organizationId, supervisorId) => {
        const members = await User.find(
            { organizationId: organizationId, role: "Member", supervisorId: supervisorId },
            "name email avatarUrl"
        );
        return members;
    },

    createMember: async (currUserOrgId, currUserId, name, email, password) => {
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            throw new Error('Email Already in Use');
        }

        // Role is hardcoded to "Member" for manager creation
        const newUser = await User.create({
            name: name,
            email: email,
            password: password, // Model will hash this
            role: "Member",
            organizationId: currUserOrgId,
            supervisorId: currUserId
        });
        return newUser;
    },

    updateMember: async (currUserId, currUserOrgId, targetUserId, updates) => {
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            throw new Error("Member not found");
        }

        // Check if target user is in the same org and under current manager's supervision
        if (targetUser.organizationId.toString() !== currUserOrgId.toString() ||
            String(targetUser.supervisorId) !== String(currUserId)) {
            throw new Error("Cannot modify member outside your supervision or organization");
        }

        // Managers cannot update email or role of members
        if (updates.email) {
            throw new Error("Managers cannot update member email");
        }
        if (updates.role) {
            throw new Error("Managers cannot update member role");
        }

        const updatedMember = await User.findByIdAndUpdate(targetUserId, updates, { new: true });
        return updatedMember;
    },

    removeMemberFromSupervision: async (currUserId, currUserOrgId, targetUserId) => {
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            throw new Error("Member not found");
        }

        // Ensure the member is in the same org and supervised by the current manager
        if (targetUser.organizationId.toString() !== currUserOrgId.toString() ||
            String(targetUser.supervisorId) !== String(currUserId)) {
            throw new Error("Cannot remove member outside your supervision or organization");
        }

        targetUser.supervisorId = null; // Detach from supervisor
        await targetUser.save();
        return { message: "Member successfully removed from your supervision" };
    }
};

module.exports = managerService;