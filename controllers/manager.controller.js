const managerService = require("../services/manager.services");

const managerControllers = {
    getMembers: async (req, res) => {
        try {
            const currUser = req.user;
            const orgId = currUser.organizationId;
            const members = await managerService.getMembersUnderSupervision(orgId, currUser.id); // Use req.user.id
            res.status(200).json({ message: "Successful", users: members });
        } catch (err) {
            console.error("Error fetching members:", err.message);
            if (err.status) {
                return res.status(err.status).json({ message: err.message });
            }
            return res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    },

    createMember: async (req, res) => {
        try {
            const currUser = req.user;
            const { name, email, password } = req.body;
            // Role is implicitly "Member" when a manager creates
            const role = "Member";

            const newUser = await managerService.createMember(
                currUser.organizationId,
                currUser.id, // Use req.user.id
                name,
                email,
                password,
                role
            );

            return res.status(201).json({ message: `${role} created successfully`, user: newUser });
        } catch (err) {
            console.error("Error Creating member:", err.message);
            if (err.status) {
                return res.status(err.status).json({ error: err.message });
            }
            return res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    },

    updateMember: async (req, res) => {
        try {
            const currOp = req.user;
            const userId = req.params.userId;
            const { name, email, role, avatarUrl } = req.body;

            const updates = {};
            if (name) updates.name = name;
            if (avatarUrl) updates.avatarUrl = avatarUrl;
            // Service will handle restrictions for email and role
            if (email) updates.email = email;
            if (role) updates.role = role;

            const updatedUser = await managerService.updateMember(currOp.id, currOp.organizationId, userId, updates);

            res.status(200).json({ message: "User updated successfully", user: updatedUser });
        } catch (err) {
            console.error("Error Updating member:", err.message);
            if (err.status) {
                return res.status(err.status).json({ message: err.message });
            }
            return res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    },

    removeMember: async (req, res) => {
        try {
            const currUser = req.user;
            const targetUserId = req.params.userId;

            const result = await managerService.removeMemberFromSupervision(currUser.id, currUser.organizationId, targetUserId);

            res.status(200).json({ message: result.message });
        } catch (err) {
            console.error("Error while Removing member:", err.message);
            if (err.status) {
                return res.status(err.status).json({ error: err.message });
            }
            return res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    },
};

module.exports = managerControllers;