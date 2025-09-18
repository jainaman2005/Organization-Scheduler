const authService = require("../services/auth.services");

const authController = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const token = await authService.login(email, password);

            res.cookie("token", token, {
                httpOnly: true,
                maxAge: 3600000, // 1 hour
                sameSite: 'Lax',
                secure: process.env.NODE_ENV === "production", // Use secure in production
            });
            return res.status(200).json({ message: 'Login Successfully' });
        } catch (err) {
            console.error("Error while Login:", err.message);
            // Map service errors to appropriate HTTP responses
            if (err.status) {
                return res.status(err.status).json({ message: err.message });
            }
            return res.status(500).json({ message: 'Internal Server Error during Login', error: err.message });
        }
    },

    register: async (req, res) => {
        try {
            const { name, email, password, role, organizationId } = req.body;
            const newUser = await authService.register(name, email, password, role, organizationId);
            return res.status(201).json({ message: `${role} Created Successfully`, user: { name: newUser.name, email: newUser.email } });
        } catch (err) {
            console.error("Error during registration:", err.message);
            if (err.status) {
                return res.status(err.status).json({ message: err.message });
            }
            return res.status(500).json({ error: 'Internal Server Error', message: err.message });
        }
    },

    logout: async (req, res) => {
        try {
            // No service call needed, as it's purely a cookie operation
            res.clearCookie("token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });
            return res.status(200).json({ message: "Logged out successfully" });
        } catch (err) {
            console.error("Error during logout:", err.message);
            return res.status(500).json({ message: "Error during logout", error: err.message });
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;
            await authService.forgotPassword(email);
            return res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
        } catch (err) {
            console.error("Error in forgotPassword:", err.message);
            if (err.status) {
                return res.status(err.status).json({ message: err.message });
            }
            return res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    },

    resetPassword: async (req, res) => {
        try {
            const { token, newPassword } = req.body;
            await authService.resetPassword(token, newPassword);
            return res.status(200).json({ message: "Password has been reset successfully." });
        } catch (err) {
            console.error("Error in resetPassword:", err.message);
            if (err.status) {
                return res.status(err.status).json({ message: err.message });
            }
            return res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    }
};

module.exports = authController;