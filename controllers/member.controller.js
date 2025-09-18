const memberService = require("../services/member.services");

const memberControllers = {
    getOwnProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const user = await memberService.getOwnProfile(userId);

            return res.status(200).json({
                user: {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatarUrl: user.avatarUrl,
                    organization: {
                        id: user.organizationId._id,
                        name: user.organizationId.name,
                    }
                }
            });
        } catch (err) {
            console.error("Error in getOwnProfile:", err.message);
            if (err.status) {
                return res.status(err.status).json({ message: err.message });
            }
            res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    },

    updateOwnProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const { name, avatarUrl } = req.body;
            const updateFields = {};
            if (name) updateFields.name = name;
            if (avatarUrl) updateFields.avatarUrl = avatarUrl;

            const updatedUser = await memberService.updateOwnProfile(userId, updateFields);

            res.status(200).json({
                message: "Profile updated",
                user: {
                    id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    avatarUrl: updatedUser.avatarUrl,
                    organizationId: updatedUser.organizationId,
                },
            });
        } catch (err) {
            console.error("Error in updateOwnProfile:", err.message);
            if (err.status) {
                return res.status(err.status).json({ message: err.message });
            }
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        }
    },

    updateOwnPassword: async (req, res) => {
        try {
            const { oldPassword, newPassword } = req.body;
            const userId = req.user.id;

            const updatedUser = await memberService.updateOwnPassword(userId, oldPassword, newPassword);

            res.status(200).json({
                message: "Password Updated Successfully",
                user: {
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email
                }
            });
        } catch (err) {
            console.error("Error in updateOwnPassword:", err.message);
            if (err.status) {
                return res.status(err.status).json({ message: err.message });
            }
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        }
    }
};

module.exports = memberControllers;