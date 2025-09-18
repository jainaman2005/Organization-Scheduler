const organizationService = require("../services/organization.services.js");

const organizationController = {
    register: async (req, res) => {
        try {
            const { orgName, adminName, email, password } = req.body;
            const newOrg = await organizationService.registerOrganization(orgName, adminName, email, password);
            return res.status(201).json({ message: "Admin & Organization created", Org: newOrg });
        } catch (err) {
            console.error("Error in organization registration:", err.message);
            if (err.status) {
                return res.status(err.status).json({ message: err.message });
            }
            return res.status(500).json({ message: 'Internal Server Error', error: err.message });
        }
    },

    deleteOrg: async (req, res) => {
        try {
            const orgId = req.params.orgId;
            const currentUserId = req.user.id; // Assuming `req.user.id` is the current user's ID
            const currentUserOrgId = req.user.organizationId; // Assuming `req.user.organizationId`

            const result = await organizationService.deleteOrganization(orgId, currentUserId, currentUserOrgId);
            res.status(200).json({ message: result.message });
        } catch (err) {
            console.error("Error deleting organization:", err.message);
            if (err.status) {
                return res.status(err.status).json({ message: err.message });
            }
            res.status(500).json({ message: "Error deleting organization", error: err.message });
        }
    }
};

module.exports = organizationController;