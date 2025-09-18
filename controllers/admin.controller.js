const adminService = require("../services/admin.services");

const adminControllers = {
    getAllUsersInOrg: async (req, res) => {
        try {
            const currUser = req.user;
            const { managers, members } = await adminService.getAllUsersInOrg(currUser.organizationId);
            res.status(200).json({ message: "Users fetched successfully", users: { managers, members } });
        } catch (err) {
            console.error("Error fetching all Users:", err.message);
            if (err.status) {
                return res.status(err.status).json({ message: err.message });
            }
            return res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    },

    updateAnyUser: async (req, res) => {
        try {
            const currUser = req.user;
            const { userId } = req.params;
            const { name, email, role, avatarUrl, supervisorId } = req.body;

            let updateFields = {};
            if (name) updateFields.name = name;
            if (email) updateFields.email = email;
            if (role) updateFields.role = role;
            if (avatarUrl) updateFields.avatarUrl = avatarUrl;
            if (supervisorId) updateFields.supervisorId = supervisorId;

            const updatedUser = await adminService.updateAnyUser(currUser.id, currUser.organizationId, userId, updateFields);

            res.status(200).json({ message: "User updated successfully", user: updatedUser });
        } catch (err) {
            console.error("Error Updating the Users:", err.message);
            if (err.status) {
                return res.status(err.status).json({ message: err.message });
            }
            return res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    },

    createUser: async (req, res) => {
        try {
            const currUser = req.user;
            const { name, email, password, role, supervisorId } = req.body;

            const newUser = await adminService.createUser(
                currUser.organizationId,
                name,
                email,
                password,
                role,
                supervisorId
            );

            return res.status(201).json({
                message: `${newUser.role} created successfully`,
                user: {
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    supervisorId: newUser.supervisorId
                }
            });
        } catch (err) {
            console.error("Error Creating User:", err.message);
            if (err.status) {
                return res.status(err.status).json({ error: err.message });
            }
            return res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    },

    deleteAnyUser: async (req, res) => {
        try {
            const currUser = req.user;
            const targetUserId = req.params.userId;

            const userDeleted = await adminService.deleteAnyUser(currUser.id, currUser.organizationId, targetUserId);

            return res.status(200).json({ message: "Account has been deleted successfully.", user: userDeleted });
        } catch (err) {
            console.error("Error Deleting the User:", err.message);
            if (err.status) {
                return res.status(err.status).json({ error: err.message });
            }
            return res.status(500).json({ message: 'Internal Server Error', error: err.message });
        }
    },
};

module.exports = adminControllers;