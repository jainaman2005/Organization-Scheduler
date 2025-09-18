const taskService = require("../services/task.services");

const taskController = {
    createTask: async (req, res) => {
        try {
            const currUser = req.user;
            const { title, description, assignedTo, timeline } = req.body;

            const task = await taskService.createTask(currUser, title, description, assignedTo, timeline);
            return res.status(201).json(task);
        } catch (err) {
            console.error("Error in createTask:", err.message);
            if (err.status) {
                return res.status(err.status).json({ message: err.message });
            }
            return res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    },

    getManagedTasks: async (req, res) => {
        try {
            const currUser = req.user;
            const tasks = await taskService.getManagedTasks(currUser.id, currUser.role);
            return res.status(200).json(tasks);
        } catch (err) {
            console.error("Error in getManagedTasks:", err.message);
            if (err.status) {
                return res.status(err.status).json({ message: err.message });
            }
            return res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    },

    getTasksAssignedToMe: async (req, res) => {
        try {
            const currUser = req.user;
            const tasks = await taskService.getTasksAssignedToMe(currUser.id);
            return res.status(200).json(tasks);
        } catch (err) {
            console.error("Error in getTasksAssignedToMe:", err.message);
            if (err.status) {
                return res.status(err.status).json({ message: err.message });
            }
            return res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    },

    getTaskById: async (req, res) => {
        try {
            const currUser = req.user;
            const { taskId } = req.params;
            const task = await taskService.getTaskById(currUser.id, taskId);
            return res.status(200).json(task);
        } catch (err) {
            console.error("Error in getTaskById:", err.message);
            if (err.status) {
                return res.status(err.status).json({ message: err.message });
            }
            return res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    },

    updateTask: async (req, res) => {
        try {
            const currUser = req.user;
            const { taskId } = req.params;
            const { createdBy, status, ...updateData } = req.body; // Prevent direct update of createdBy and status via this route

            const task = await taskService.updateTask(currUser, taskId, updateData);
            return res.status(200).json(task);
        } catch (err) {
            console.error("Error in updateTask:", err.message);
            if (err.status) {
                return res.status(err.status).json({ message: err.message });
            }
            return res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    },

    updateTaskStatus: async (req, res) => {
        try {
            const currUser = req.user;
            const { taskId } = req.params;
            const { status } = req.body;

            const task = await taskService.updateTaskStatus(currUser.id, taskId, status);
            return res.status(200).json(task);
        } catch (err) {
            console.error("Error in updateTaskStatus:", err.message);
            if (err.status) {
                return res.status(err.status).json({ message: err.message });
            }
            return res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    },

    deleteTask: async (req, res) => {
        try {
            const currUser = req.user;
            const { taskId } = req.params;

            const result = await taskService.deleteTask(currUser.id, currUser.role, taskId);
            return res.status(200).json(result);
        } catch (err) {
            console.error("Error in deleteTask:", err.message);
            if (err.status) {
                return res.status(err.status).json({ message: err.message });
            }
            return res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    }
};

module.exports = taskController;