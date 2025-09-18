const Organization = require("../models/organization.model");
const User = require("../models/user.model");
// bcrypt is handled by user model pre-save hook

const organizationService = {
    registerOrganization: async (orgName, adminName, email, password) => {
        let org = await Organization.findOne({ name: orgName });
        if (org) {
            throw new Error('Organization Name already in use.');
        }

        org = await Organization.create({ name: orgName });

        // User model's pre-save hook will hash the password
        const admin = await User.create({
            name: adminName,
            email: email,
            password: password, // Raw password, will be hashed
            role: "Admin",
            organizationId: org._id
        });

        org.admin = admin._id;
        await org.save();

        const populatedOrg = await Organization.findById(org._id)
            .populate("admin", "name email");

        return populatedOrg;
    },

    deleteOrganization: async (orgId, userId) => {
        // The pre-middleware on Organization model handles deleting associated users and tasks
        const org = await Organization.findOneAndDelete({ _id: orgId });
        if (!org) {
            throw new Error("Organization not found");
        }
        return org;
    }
};

module.exports = organizationService;