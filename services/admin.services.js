const User = require("../models/user.model");
const Task = require("../models/task.model");
const bcrypt = require('bcryptjs');

const adminService = {
    getAllUsersInOrg: async (organizationId) => {
        const [managers, members] = await Promise.all([
            User.find(
                { organizationId: organizationId, role: "Manager" },
                "name email role avatarUrl"
            ),
            User.find(
                { organizationId: organizationId, role: "Member" },
                "name email supervisorId avatarUrl"
            ).populate('supervisorId', 'name email')
        ]);
        return { managers, members };
    },

    updateAnyUser: async (currUserId, currUserOrgId, targetUserId, updates) => {
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            throw new Error("User not found");
        }

        if (targetUser.organizationId.toString() !== currUserOrgId.toString()) {
            throw new Error("Cannot modify user outside your organization");
        }

        // Prevent admin from changing their own role/email directly via this endpoint
        if (targetUser._id.toString() === currUserId.toString()) {
            if (updates.role && updates.role !== targetUser.role) {
                throw new Error("Admins cannot change their own role via this endpoint");
            }
            if (updates.email && updates.email !== targetUser.email) {
                 throw new Error("Admins cannot change their own email via this endpoint");
            }
        }

        if (updates.email) {
            const emailExists = await User.findOne({ email: updates.email, _id: { $ne: targetUserId } });
            if (emailExists) {
                throw new Error("Email already in use");
            }
        }

        if (updates.role) {
            if (updates.role === "Admin" && targetUser._id.toString() !== currUserId.toString()) {
                throw new Error("Cannot promote another user to Admin role");
            }

            if (updates.role === "Member" && targetUser.role === "Manager") {
                // If a manager becomes a member, remove their supervision and associated tasks
                await User.updateMany(
                    { supervisorId: targetUserId },
                    { $set: { supervisorId: null } }
                );
                await Task.deleteMany({ createdBy: targetUserId });
            }
        }

        if (updates.supervisorId) {
            const supervisor = await User.findById(updates.supervisorId);
            if (!supervisor || (supervisor.role !== "Manager" && supervisor.role !== "Admin")) {
                throw new Error("Provided supervisor is invalid or cannot be a supervisor.");
            }
             if (supervisor.organizationId.toString() !== currUserOrgId.toString()) {
                throw new Error("Supervisor must belong to the same organization");
            }
        } else if (updates.role && updates.role !== "Member") {
            // If changing to Manager/Admin, ensure supervisorId is null
            updates.supervisorId = null;
        }


        const updatedUser = await User.findByIdAndUpdate(targetUserId, updates, { new: true });
        return updatedUser;
    },

    createUser: async (currUserOrgId, name, email, password, role, supervisorId) => {
        const emailUsed = await User.findOne({ email: email });
        if (emailUsed) {
            throw new Error('Email Already in Use');
        }

        if (role === "Admin") {
            throw new Error("Admin cannot create another Admin.");
        }

        if (supervisorId) {
            const supervisor = await User.findById(supervisorId);
            if (!supervisor || (supervisor.role !== "Manager" && supervisor.role !== "Admin")) {
                throw new Error("Provided supervisor is invalid or cannot be a supervisor.");
            }
            if (supervisor.organizationId.toString() !== currUserOrgId.toString()) {
                throw new Error("Supervisor must belong to the same organization.");
            }
        } else if (role === "Member") {
            // Members must have a supervisor unless explicitly null
            // This might be a business rule, consider if it's always true.
            // For now, allow null if not provided
        }


        const newUser = await User.create({
            name,
            email,
            password, // Model will hash this
            role,
            organizationId: currUserOrgId,
            supervisorId: supervisorId || null
        });
        return newUser;
    },

    deleteAnyUser: async (currUserId, currUserOrgId, targetUserId) => {
        const targetUser = await User.findById(targetUserId).populate('organizationId', '_id');
        if (!targetUser) {
            throw new Error("User Not Exists.");
        }

        if (currUserOrgId.toString() !== targetUser.organizationId._id.toString()) {
            throw new Error("Not authorized across organizations.");
        }

        if (currUserId.toString() === targetUser._id.toString()) {
            throw new Error("Admins cannot delete their own account. Can delete by deleting the Organization.");
        }

        if (targetUser.role === "Manager") {
            await User.updateMany(
                { supervisorId: targetUser._id },
                { $set: { supervisorId: null } }
            );
            await Task.deleteMany({ createdBy: targetUser._id });
        }

        await Task.deleteMany({ assignedTo: targetUser._id });
        const userDeleted = await User.findByIdAndDelete(targetUser._id);
        return userDeleted;
    }
};

module.exports = adminService;