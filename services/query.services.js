const User = require("../models/user.model.js");
const Query = require("../models/query.model");
const Task = require("../models/task.model.js");

const queryService = {
    raiseQuery: async (taskId, message, raisedByUserId, userRole) => {
        const task = await Task.findById(taskId);
        if (!task) {
            throw new Error("Task not found");
        }
        // Ensure user is involved in the task (either assigned or created it)
        if (String(task.assignedTo) !== String(raisedByUserId) && String(task.createdBy) !== String(raisedByUserId)) {
            throw new Error("Not authorized to raise a query for this task");
        }

        let visibleTo = [raisedByUserId]; // Always visible to the raiser

        if (userRole === "Member") {
            const memberUser = await User.findById(raisedByUserId).select("supervisorId");
            if (memberUser && memberUser.supervisorId) {
                visibleTo.push(memberUser.supervisorId);
            }
        } else if (userRole === "Manager") {
            // Manager's query is visible to themselves and members they supervise on this task
            // This logic might need refinement based on exact business rules for visibility
            const members = await User.find({ supervisorId: raisedByUserId, organizationId: task.organizationId, role: "Member" });
            visibleTo = [...visibleTo, ...members.map(m => m._id)];
        }
        
        const query = new Query({
            taskId,
            message,
            raisedBy: raisedByUserId,
            visibleTo: [...new Set(visibleTo)], // Ensure unique IDs
        });
        await query.save();
        return { query, task: { title: task.title, description: task.description } }; // Return relevant task info
    },

    getQueriesByTask: async (taskId, userId) => {
        const task = await Task.findById(taskId);
        if (!task) {
            throw new Error("Task not found");
        }
        // Basic check: user should be involved in the task to see its queries
        if (String(task.assignedTo) !== String(userId) && String(task.createdBy) !== String(userId)) {
            throw new Error("Not authorized to view queries for this task");
        }

        const queries = await Query.find({ taskId: taskId })
            .populate("raisedBy", "name role avatarUrl")
            .populate("visibleTo", "name role"); // Populate visibleTo for debugging/future use
        return queries;
    },

    addResponse: async (queryId, responderId, responseMessage) => {
        const query = await Query.findById(queryId);
        if (!query) {
            throw new Error("Query Not Found");
        }

        const isVisible = query.visibleTo.some(memberId => String(memberId) === String(responderId));
        if (!isVisible) {
            throw new Error("Forbidden: Not allowed to add response to this query");
        }

        const response = { responderId, responseMessage, createdAt: new Date() };
        query.responses.push(response);
        await query.save();
        return response;
    },

    getResponses: async (queryId, userId) => {
        const query = await Query.findById(queryId).populate("responses.responderId", "name email avatarUrl");
        if (!query) {
            throw new Error("Query Not Found.");
        }
        // Ensure user can view these responses
        const isVisible = query.visibleTo.some(memberId => String(memberId) === String(userId));
        if (!isVisible && String(query.raisedBy) !== String(userId)) { // Also allow raiser to see
             throw new Error("Forbidden: Not allowed to view responses for this query");
        }
        return query.responses;
    },

    deleteResponse: async (queryId, responseId, userId) => {
        const query = await Query.findById(queryId);
        if (!query) {
            throw new Error("Query not found");
        }

        const responseIndex = query.responses.findIndex(r => String(r._id) === String(responseId));
        if (responseIndex === -1) {
            throw new Error("Response not found");
        }

        // Only the responder or Admin/Manager (if they have visibility) can delete their response
        if (String(query.responses[responseIndex].responderId) !== String(userId) && userId.role !== 'Admin' && userId.role !== 'Manager') {
            throw new Error("Forbidden: Not authorized to delete this response");
        }

        query.responses.splice(responseIndex, 1);
        await query.save();
        return query;
    },

    editResponse: async (queryId, responseId, responseMessage, userId) => {
        const query = await Query.findById(queryId);
        if (!query) {
            throw new Error("Query not found");
        }

        const response = query.responses.id(responseId);
        if (!response) {
            throw new Error("Response not found");
        }

        if (String(userId) !== String(response.responderId)) {
            throw new Error("Forbidden: Not allowed to edit this response");
        }

        response.responseMessage = responseMessage;
        await query.save();
        return query;
    },

    resolveQuery: async (queryId, resolvedStatus, userId) => {
        const query = await Query.findById(queryId);
        if (!query) {
            throw new Error("Query not found");
        }

        if (String(query.raisedBy) !== String(userId)) {
            throw new Error("Only the query raiser can resolve this query");
        }

        query.resolved = resolvedStatus;
        await query.save();
        return query;
    },

    deleteQuery: async (queryId, userId, userRole) => {
        const query = await Query.findById(queryId);
        if (!query) {
            throw new Error("Query not found");
        }

        const allowedRoles = ["Admin", "Manager"];
        if (!allowedRoles.includes(userRole) && String(query.raisedBy) !== String(userId)) {
            throw new Error("Forbidden: Only Admin, Manager, or the raiser can delete this query");
        }
        
        await Query.deleteOne({ _id: queryId }); // Use deleteOne to trigger pre-hooks if any, or findByIdAndDelete
        return { message: "Query deleted successfully" };
    }
};

module.exports = queryService;