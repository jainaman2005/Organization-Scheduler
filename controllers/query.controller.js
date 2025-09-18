const queryService = require("../services/query.services");

const queryController = {
    raiseQuery: async (req, res) => {
        try {
            const { message } = req.body;
            const { taskId } = req.params; // Assuming taskId comes from params as per route structure
            const userId = req.user.id;
            const userRole = req.user.role;

            const query = await queryService.raiseQuery(taskId, message, userId, userRole);
            res.status(201).json({ message: "Query raised successfully", query });
        } catch (error) {
            console.error("Error raising query:", error.message);
            if (error.status) {
                return res.status(error.status).json({ message: error.message });
            }
            res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    },

    getQueriesByTask: async (req, res) => {
        try {
            const { taskId } = req.params; // Assuming taskId comes from params
            const userId = req.user.id;

            const queries = await queryService.getQueriesByTask(taskId, userId);
            res.status(200).json({ queries });
        } catch (error) {
            console.error("Error fetching queries by task:", error.message);
            if (error.status) {
                return res.status(error.status).json({ message: error.message });
            }
            res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    },

    addResponse: async (req, res) => {
        try {
            const { queryId } = req.params;
            const { responseMessage } = req.body;
            const responderId = req.user.id;

            const response = await queryService.addResponse(queryId, responseMessage, responderId);
            res.status(201).json({ message: "Response added", response });
        } catch (error) {
            console.error("Error adding response:", error.message);
            if (error.status) {
                return res.status(error.status).json({ message: error.message });
            }
            res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    },

    getResponses: async (req, res) => {
        try {
            const { queryId } = req.params;
            const userId = req.user.id;

            const responses = await queryService.getResponses(queryId, userId);
            res.status(200).json({ responses });
        } catch (error) {
            console.error("Error fetching responses:", error.message);
            if (error.status) {
                return res.status(error.status).json({ message: error.message });
            }
            res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    },

    deleteResponse: async (req, res) => {
        try {
            const { queryId, responseId } = req.params;
            const userId = req.user.id;

            await queryService.deleteResponse(queryId, responseId, userId);
            res.status(200).json({ message: "Response deleted successfully" });
        } catch (error) {
            console.error("Error deleting response:", error.message);
            if (error.status) {
                return res.status(error.status).json({ message: error.message });
            }
            res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    },

    editResponse: async (req, res) => {
        try {
            const { queryId, responseId } = req.params;
            const { responseMessage } = req.body;
            const userId = req.user.id;

            await queryService.editResponse(queryId, responseId, responseMessage, userId);
            res.status(200).json({ message: "Response updated successfully" });
        } catch (error) {
            console.error("Error updating response:", error.message);
            if (error.status) {
                return res.status(error.status).json({ message: error.message });
            }
            res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    },

    resolveQuery: async (req, res) => {
        try {
            const { queryId } = req.params;
            const { resolved } = req.body;
            const userId = req.user.id;

            await queryService.resolveQuery(queryId, resolved, userId);
            res.status(200).json({ message: "Query resolved successfully" });
        } catch (error) {
            console.error("Error resolving query:", error.message);
            if (error.status) {
                return res.status(error.status).json({ message: error.message });
            }
            res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    },

    deleteQuery: async (req, res) => {
        try {
            const { queryId } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;

            await queryService.deleteQuery(queryId, userId, userRole);
            res.status(200).json({ message: "Query deleted successfully" });
        } catch (error) {
            console.error("Error deleting query:", error.message);
            if (error.status) {
                return res.status(error.status).json({ message: error.message });
            }
            res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    },
};

module.exports = queryController;