const Task = require("../models/task.model");
const User = require("../models/user.model");

const taskService = {
    createTask: async (currUser, title, description, assignedToId, timeline, status = "Not Started") => {
        const assignee = await User.findById(assignedToId);
        if (!assignee && assignee.organizationId.toString() !== currUser.organizationId.toString()) {
            throw new Error("Assignee not found");        
        }

        // RBAC checks
        if (currUser.role === "Admin" && assignee.role !== "Manager") {
            throw new Error("Admin can assign tasks only to Managers");
        }
        if (currUser.role === "Manager" && assignee.role !== "Member") {
            throw new Error("Manager can assign tasks only to Members");
        }

        const task = await Task.create({
            title,
            description,
            createdBy: currUser.id, // Use currUser.id
            assignedTo: assignedToId,
            timeline,
            organizationId: currUser.organizationId,
            status
        });
        return task;
    },

    getManagedTasks: async (currUserId, currUserRole) => {
        if (currUserRole === "Member") {
            throw new Error("Forbidden: Only Managers or Admins can view managed tasks");
        }
        const tasks = await Task.find({ createdBy: currUserId })
            .populate("assignedTo", "name email role avatarUrl")
            .populate("createdBy", "name email role avatarUrl"); // Populate createdBy for full context
        return tasks;
    },

    getTasksAssignedToMe: async (currUserId) => {
        const tasks = await Task.find({ assignedTo: currUserId })
            .populate("assignedTo", "name email role avatarUrl")
            .populate("createdBy", "name email role avatarUrl");
        return tasks;
    },

    getTaskById: async (taskId, currUserId) => {
        const task = await Task.findById(taskId)
            .populate("assignedTo", "name email role avatarUrl")
            .populate("createdBy", "name email role avatarUrl");

        if (!task) {
            throw new Error("Task not found");
        }

        if (String(task.assignedTo._id) !== String(currUserId) && String(task.createdBy._id) !== String(currUserId)) {
            throw new Error("Not authorized to view this task");
        }
        return task;
    },

    updateTask: async (currUser, taskId, updateData) => {
        const task = await Task.findById(taskId).populate("assignedTo createdBy");
        if (!task) {
            throw new Error("Task not found");
        }

        // Only the creator or Admin can update other fields (excluding status, which has its own endpoint)
        if (String(task.createdBy._id) !== String(currUser.id) && currUser.role !== "Admin") {
            throw new Error("You are not authorized to update this task");
        }

        // RBAC for updating assignee
        if (updateData.assignedTo) {
            const newAssignee = await User.findById(updateData.assignedTo);
            if (!newAssignee && newAssignee.organizationId.toString() !== currUser.organizationId.toString()) {
                throw new Error("New assignee not found");
            }
            
            if (currUser.role === "Admin" && newAssignee.role !== "Manager") {
                throw new Error("Admin can assign tasks only to Managers");
            }
            if (currUser.role === "Manager" && newAssignee.role !== "Member") {
                throw new Error("Manager can assign tasks only to Members");
            }
        }

        // Prevent direct status update here; use updateTaskStatus for that.
        const { status, createdBy, ...fieldsToUpdate } = updateData;
        Object.assign(task, fieldsToUpdate);
        await task.save();
        return task;
    },

    updateTaskStatus: async (currUserId, taskId, newStatus) => {
        const task = await Task.findById(taskId);
        if (!task) {
            throw new Error("Task not found");
        }

        if (String(task.assignedTo) !== String(currUserId)) {
            throw new Error("Not authorized to update this task's status");
        }

        task.status = newStatus;
        await task.save();
        return task;
    },

    deleteTask: async (currUser, taskId) => {
        const task = await Task.findById(taskId);
        if (!task) {
            throw new Error("Task not found");
        }

        if (String(task.createdBy) !== String(currUser.id) && currUser.role !== "Admin") {
            throw new Error("Not authorized to delete this task");
        }

        await task.deleteOne(); // Using deleteOne to trigger pre-hook
        return { message: "Task deleted successfully" };
    }
};

module.exports = taskService;